import { useEffect, useMemo, useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import LoadingOverlay from '../../src/components/LoadingOverlay';
import { adminAPI } from '../../src/api/admin';
import { useAuthStore } from '../../src/store/authStore';

export default function AdminIndex() {

  const { user } = useAuthStore();
  const role = user?.role;

  const canAccess = role === 'admin' || role === 'librarian';

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Total Books', value: stats.total_books },
      { label: 'Available Books', value: stats.available_books },
      { label: 'Total Authors', value: stats.total_authors },
      { label: 'Active Loans', value: stats.active_loans },
      { label: 'Pending Returns', value: stats.pending_returns },
      { label: 'Overdue Loans', value: stats.overdue_loans },
      { label: 'Active Reservations', value: stats.active_reservations },
      { label: 'Unpaid Fines', value: stats.unpaid_fines },

      { label: 'Total Users', value: stats.total_users ?? 0 },
      { label: 'Admins', value: stats.user_admins ?? 0 },
      { label: 'Librarians', value: stats.user_librarians ?? 0 },
      { label: 'Members', value: stats.user_members ?? 0 },

    ];
  }, [stats]);


  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      if (!canAccess) {
        setIsLoading(false);
        setError({ message: 'Access denied' });
        return;
      }

      try {
        const res = await adminAPI.getDashboardStats();
        if (cancelled) return;
        setStats(res.data);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data || { message: 'Failed to load dashboard stats' });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [canAccess]);

  return (
    <View style={{ flex: 1 }}>
      <LoadingOverlay visible={isLoading} message="Loading admin dashboard..." />

      <ScrollView contentContainerStyle={{ padding: 16, opacity: isLoading ? 0.6 : 1 }}>
        <Text style={{ fontSize: 26, fontWeight: '700', marginBottom: 12 }}>Admin Dashboard</Text>

        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 14 }}>
          Live stats refreshes on page load
        </Text>


        {error ? (
          <Text style={{ color: 'crimson', marginBottom: 12 }}>
            {typeof error?.error === 'string' ? error.error : error?.message || 'Access denied'}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cards.map((c) => (
            <View
              key={c.label}
              style={{
                width: '48%',
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: 12,
                margin: '1%',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text style={{ fontSize: 14, color: '#374151' }}>{c.label}</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', marginTop: 6 }}>{c.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

