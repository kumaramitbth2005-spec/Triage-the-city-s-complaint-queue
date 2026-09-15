import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { complaintApi } from '../api/complaintApi';
import { notificationApi } from '../api/notificationApi';
import { mockComplaints } from '../data/mockComplaints';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDataImported, setIsDataImported] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);

  const fetchComplaints = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.getAll({ page: 1, limit: 50, ...params });
      const data = res.data?.data || [];
      // Normalize backend data to match frontend field expectations
      const normalized = data.map(c => ({
        ...c,
        id: c.complaintId || c._id,
        normalizedLocality: c.location?.locality || 'Unknown',
        ward: c.location?.ward || '',
        confidence: c.aiAnalysis?.overallConfidence || 0,
        duplicateStatus: c.duplicateCandidates?.length > 0 ? 'Possible' : 'None',
        inputType: c.inputMethod === 'voice' ? 'Voice' : c.inputMethod === 'photo' ? 'Image' : 'Text',
        language: c.detectedLanguage || c.originalLanguage || 'English',
        timestamp: c.createdAt,
        evidence: c.entities?.keywords || c.aiAnalysis?.explanation || [],
        urgencyReason: c.aiAnalysis?.explanation?.[1] || '',
        sourceChannel: 'App',
      }));
      setComplaints(normalized);
      setUsingMockData(false);
    } catch (err) {
      console.warn('Backend unavailable, using mock data:', err.message);
      setComplaints(mockComplaints);
      setUsingMockData(true);
      setError('Backend unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.warn('Backend notifications unavailable, using empty array');
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchNotifications();
  }, [fetchComplaints, fetchNotifications]);

  const updateComplaintStatus = async (id, newStatus, newUrgency, newCategory, newDepartment) => {
    if (usingMockData) {
      setComplaints(prev => prev.map(c =>
        (c.id === id || c.complaintId === id)
          ? { ...c, status: newStatus, urgency: newUrgency || c.urgency, category: newCategory || c.category, department: newDepartment || c.department }
          : c
      ));
      return;
    }
    try {
      await complaintApi.triage(id, {
        status: newStatus,
        urgency: newUrgency,
        category: newCategory,
        department: newDepartment
      });
      await fetchComplaints();
    } catch (err) {
      console.error('Failed to update complaint status', err);
      // Optimistic update on error
      setComplaints(prev => prev.map(c =>
        (c.id === id || c.complaintId === id)
          ? { ...c, status: newStatus }
          : c
      ));
    }
  };

  const addComplaint = async (complaintData) => {
    if (usingMockData) {
      const mockEntry = { ...complaintData, id: complaintData.id || `CMP-${Date.now()}` };
      setComplaints(prev => [mockEntry, ...prev]);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'complaint',
        title: 'New Complaint Received',
        message: `${mockEntry.id} — ${mockEntry.category} in ${mockEntry.normalizedLocality || 'Unknown area'}`,
        time: 'Just now',
        read: false,
        route: '/complaints',
      }, ...prev]);
      return mockEntry;
    }
    try {
      const res = await complaintApi.create(complaintData);
      await fetchComplaints();
      return res.data?.data;
    } catch (err) {
      console.error('Failed to create complaint', err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      complaints, setComplaints,
      loading, error, usingMockData,
      isDataImported, setIsDataImported,
      updateComplaintStatus, addComplaint,
      notifications, setNotifications,
      fetchComplaints
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
