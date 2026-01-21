import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Phone, Mail, TrendingUp, Users, DollarSign, Calendar, 
  Send, MessageSquare, BarChart3, Filter, Plus, Search 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Lead {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  status: string;
  priority: string;
  aiScore: number;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  callHistory: any[];
  emailHistory: any[];
}

interface Stats {
  totalLeads: number;
  qualifiedLeads: number;
  closedWon: number;
  conversionRate: string;
  highPriorityLeads: number;
  needsFollowUp: number;
  avgScore: number;
}

const SalesDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '', minScore: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchLeads();
  }, [filter]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/sales/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/sales/leads`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filter
      });
      setLeads(data.leads);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (leadId: string, type: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/sales/leads/${leadId}/email`, 
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Email sent successfully!');
      fetchLeads();
    } catch (error) {
      alert('Failed to send email');
    }
  };

  const getAISuggestions = async (leadId: string) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/sales/leads/${leadId}/suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`AI Suggestion:\n\nNext Action: ${data.nextAction.action}\nPriority: ${data.nextAction.priority}\nReasoning: ${data.nextAction.reasoning}\n\nEmail Subject: ${data.emailSuggestion.subject}`);
    } catch (error) {
      alert('Failed to get AI suggestions');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      proposal_sent: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-green-500 text-white',
      closed_lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Sales Dashboard</h1>
        <p className="text-gray-600">Automated call management and email campaigns</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualified Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.qualifiedLeads}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Follow-up</p>
                <p className="text-2xl font-bold text-gray-900">{stats.needsFollowUp}</p>
              </div>
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select 
              id="status-filter"
              className="px-4 py-2 border rounded-lg"
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiation">Negotiation</option>
            </select>
            
            <label htmlFor="priority-filter" className="sr-only">Filter by priority</label>
            <select 
              id="priority-filter"
              className="px-4 py-2 border rounded-lg"
              value={filter.priority}
              onChange={(e) => setFilter({...filter, priority: e.target.value})}
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowAddLead(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{lead.companyName}</p>
                    <p className="text-sm text-gray-500">{lead.industry}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-gray-900">{lead.contactPerson}</p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                    {lead.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${getPriorityColor(lead.priority)}`}>
                    {lead.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${lead.aiScore}%`}}
                      />
                    </div>
                    <span className="text-sm font-medium">{lead.aiScore}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => sendEmail(lead._id, 'follow_up')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => getAISuggestions(lead._id)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                      title="AI Suggestions"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setSelectedLead(lead)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      title="View Details"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesDashboard;
