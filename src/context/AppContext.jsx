import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { complaintApi } from '../api/complaintApi';
import { notificationApi } from '../api/notificationApi';
import { fallbackComplaints } from '../data/mockComplaints';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDataImported, setIsDataImported] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const reconnectIntervalRef = useRef(null);

  const fetchComplaints = useCallback(async (params = {}) => {
    setLoading(true);
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

      // If backend returns data, use live data
      if (normalized.length > 0) {
        setComplaints(normalized);
        setUsingMockData(false);
        setError(null);
      } else {
        // Fallback to demo complaints if backend DB is empty
        setComplaints(fallbackComplaints);
        setUsingMockData(true);
        setError(null);
      }
    } catch (err) {
      console.warn('Backend unavailable or waking up, activating resilient demo mode:', err.message);
      setComplaints(fallbackComplaints);
      setUsingMockData(true);
      setError('Backend is waking up or offline. Operating in demo mode.');
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

  // Auto-reconnect polling while using mock data (e.g. Render waking up)
  useEffect(() => {
    if (usingMockData) {
      reconnectIntervalRef.current = setInterval(() => {
        complaintApi.getAll({ page: 1, limit: 5 })
          .then(res => {
            if (res.data?.success && res.data?.data?.length > 0) {
              console.log('✅ Live backend connected! Switching from demo to live data.');
              fetchComplaints();
              fetchNotifications();
            }
          })
          .catch(() => {
            // Still offline or spinning up, ignore
          });
      }, 7000);
    } else if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current);
    }

    return () => {
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    };
  }, [usingMockData, fetchComplaints, fetchNotifications]);


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

