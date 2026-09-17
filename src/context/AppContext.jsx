import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { complaintApi } from '../api/complaintApi';
import { notificationApi } from '../api/notificationApi';

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
      console.error('Failed to fetch complaints:', err.message);
      setComplaints([]);
      setUsingMockData(false);
      setError('Backend unavailable. Please check your connection.');
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
    try {
      const res = await complaintApi.create(complaintData);
      await fetchComplaints();
      return res.data?.data;
    } catch (err) {
      console.error('Failed to create complaint', err);
      throw err;
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await complaintApi.delete(id);
      await fetchComplaints();
    } catch (err) {
      console.error('Failed to delete complaint', err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      complaints, setComplaints,
      loading, error, usingMockData,
      isDataImported, setIsDataImported,
      updateComplaintStatus, addComplaint, deleteComplaint,
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

