'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown,
  LogOut,
  FileText,
  Building2,
  Trophy,
  BarChart3,
  Upload,
  Plus,
  Trash2,
  Edit,
  Search,
  X,
  Loader2,
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'ministry' | 'achievement'>('ministry');
  const [editingItem, setEditingItem] = useState<any>(null);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [token, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, ministriesRes, achievementsRes, documentsRes] = await Promise.all([
        fetch('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/ministries', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/achievements', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/documents', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const analyticsData = await analyticsRes.json();
      const ministriesData = await ministriesRes.json();
      const achievementsData = await achievementsRes.json();
      const documentsData = await documentsRes.json();

      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (ministriesData.success) setMinistries(ministriesData.data);
      if (achievementsData.success) setAchievements(achievementsData.data);
      if (documentsData.success) setDocuments(documentsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; max-age=0; samesite=lax';
    router.push('/admin/login');
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        await fetchData();
        alert('Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/25">
          <p className="text-xs text-[#5C5543] font-ui">Documents</p>
          <p className="text-2xl font-heading font-bold text-[#3A6B4B]">{analytics?.totalDocuments || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/25">
          <p className="text-xs text-[#5C5543] font-ui">Ministries</p>
          <p className="text-2xl font-heading font-bold text-[#3A6B4B]">{analytics?.totalMinistries || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/25">
          <p className="text-xs text-[#5C5543] font-ui">Achievements</p>
          <p className="text-2xl font-heading font-bold text-[#3A6B4B]">{analytics?.totalAchievements || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/25">
          <p className="text-xs text-[#5C5543] font-ui">Popular Questions</p>
          <p className="text-2xl font-heading font-bold text-[#3A6B4B]">{analytics?.popularQuestions?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/25">
          <h4 className="font-heading font-semibold mb-3">Language Usage</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm">
                <span>English</span>
                <span>{analytics?.languageUsage?.english || 70}%</span>
              </div>
              <div className="w-full h-2 bg-[#F5F0E8] rounded-full overflow-hidden">
                <div className="h-full bg-[#3A6B4B] rounded-full" style={{ width: `${analytics?.languageUsage?.english || 70}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Hausa</span>
                <span>{analytics?.languageUsage?.hausa || 30}%</span>
              </div>
              <div className="w-full h-2 bg-[#F5F0E8] rounded-full overflow-hidden">
                <div className="h-full bg-[#C9A03D] rounded-full" style={{ width: `${analytics?.languageUsage?.hausa || 30}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/25">
          <h4 className="font-heading font-semibold mb-3">Popular Questions</h4>
          <div className="space-y-2">
            {analytics?.popularQuestions?.slice(0, 3).map((q: any, i: number) => (
              <div key={i} className="flex justify-between text-sm border-b border-[#C9A03D]/10 pb-2">
                <span className="text-[#5C5543]">{q.question}</span>
                <span className="text-[#3A6B4B] font-ui">{q.count}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinistries = () => (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold">Ministries</h3>
        <button
          onClick={() => {
            setModalType('ministry');
            setEditingItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A6B4B] text-white text-sm hover:bg-[#2E5A3E] transition"
        >
          <Plus size={16} /> Add Ministry
        </button>
      </div>
      <div className="space-y-2">
        {ministries.map((m) => (
          <div key={m.id} className="flex justify-between items-center p-3 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/20 hover:shadow-md transition">
            <div>
              <p className="font-ui font-semibold">{m.name}</p>
              <p className="text-sm text-[#5C5543]">{m.name_ha} • Commissioner: {m.commissioner}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setModalType('ministry');
                  setEditingItem(m);
                  setShowModal(true);
                }}
                className="p-2 rounded-lg hover:bg-[#F5F0E8] transition"
              >
                <Edit size={16} className="text-[#5C5543]" />
              </button>
              <button className="p-2 rounded-lg hover:bg-[#B84A2C]/10 transition">
                <Trash2 size={16} className="text-[#B84A2C]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold">Achievements</h3>
        <button
          onClick={() => {
            setModalType('achievement');
            setEditingItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A03D] text-white text-sm hover:bg-[#B8922E] transition"
        >
          <Plus size={16} /> Add Achievement
        </button>
      </div>
      <div className="space-y-2">
        {achievements.map((a) => (
          <div key={a.id} className="flex justify-between items-center p-3 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/20 hover:shadow-md transition">
            <div>
              <p className="font-ui font-semibold">{a.title}</p>
              <p className="text-sm text-[#5C5543]">{a.category} • {a.year}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setModalType('achievement');
                  setEditingItem(a);
                  setShowModal(true);
                }}
                className="p-2 rounded-lg hover:bg-[#F5F0E8] transition"
              >
                <Edit size={16} className="text-[#5C5543]" />
              </button>
              <button className="p-2 rounded-lg hover:bg-[#B84A2C]/10 transition">
                <Trash2 size={16} className="text-[#B84A2C]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold">Documents</h3>
        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B84A2C] text-white text-sm hover:bg-[#9A3E24] transition cursor-pointer">
          <Upload size={16} /> Upload Document
          <input type="file" onChange={handleUploadDocument} className="hidden" accept=".pdf,.docx,.txt" />
        </label>
      </div>
      <div className="space-y-2">
        {documents.map((d) => (
          <div key={d.id} className="flex justify-between items-center p-3 rounded-xl bg-[#FFFDF9] border border-[#C9A03D]/20 hover:shadow-md transition">
            <div>
              <p className="font-ui font-semibold">{d.name}</p>
              <p className="text-sm text-[#5C5543]">Uploaded: {new Date(d.uploadedAt).toLocaleDateString()}</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-[#B84A2C]/10 transition">
              <Trash2 size={16} className="text-[#B84A2C]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4EEE4]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FFFDF9]/80 backdrop-blur-xl border-b border-[#C9A03D]/20">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A03D] via-[#B84A2C] to-[#3A6B4B] flex items-center justify-center shadow-lg">
              <Crown size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-xs text-[#5C5543]">Bauchi AI Governor Assistant</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#F5F0E8] transition text-[#B84A2C]"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 py-4 flex gap-2 border-b border-[#C9A03D]/20 bg-[#FFFDF9]/50">
        {[
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'ministries', label: 'Ministries', icon: Building2 },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'documents', label: 'Documents', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === tab.id
                ? 'bg-[#3A6B4B] text-white shadow-md'
                : 'hover:bg-[#F5F0E8] text-[#5C5543]'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={32} className="animate-spin text-[#3A6B4B]" />
          </div>
        ) : (
          <>
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'ministries' && renderMinistries()}
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'documents' && renderDocuments()}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDF9] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-lg font-semibold">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'ministry' ? 'Ministry' : 'Achievement'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[#F5F0E8] rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowModal(false);
                fetchData();
              }}
            >
              {modalType === 'ministry' ? (
                <>
                  <input
                    type="text"
                    placeholder="Ministry Name"
                    defaultValue={editingItem?.name || ''}
                    className="w-full p-3 rounded-xl border border-[#C9A03D]/30 mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Hausa Name"
                    defaultValue={editingItem?.name_ha || ''}
                    className="w-full p-3 rounded-xl border border-[#C9A03D]/30 mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Commissioner Name"
                    defaultValue={editingItem?.commissioner || ''}
                    className="w-full p-3 rounded-xl border border-[#C9A03D]/30 mb-3"
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Achievement Title"
                    defaultValue={editingItem?.title || ''}
                    className="w-full p-3 rounded-xl border border-[#C9A03D]/30 mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    defaultValue={editingItem?.category || ''}
                    className="w-full p-3 rounded-xl border border-[#C9A03D]/30 mb-3"
                  />
                  <input
                    type="number"
                    placeholder="Year"
                    defaultValue={editingItem?.year || new Date().getFullYear()}
                    className="w-full p-3 rounded-xl border border-[#C9A03D]/30 mb-3"
                  />
                </>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#3A6B4B] text-white font-ui font-semibold hover:bg-[#2E5A3E] transition"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;