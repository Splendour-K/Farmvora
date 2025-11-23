import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Clock, MessageSquare, Reply } from 'lucide-react';

interface PendingQuestion {
  id: string;
  question: string;
  created_at: string;
  status: string;
  user_id: string;
  project_id: string;
  admin_reply: string | null;
  user: {
    email: string;
    full_name: string;
  };
  project: {
    title: string;
  };
}

export function QuestionApprovals() {
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadPendingQuestions();
  }, []);

  const loadPendingQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('project_questions')
        .select(`
          id,
          question,
          created_at,
          status,
          user_id,
          project_id,
          admin_reply,
          user:user_id(email, full_name),
          project:project_id(title)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingQuestions(data || []);
    } catch (error) {
      console.error('Error loading pending questions:', error);
    }
  };

  const handleApprove = async (questionId: string, userId: string, projectId: string, withReply: boolean = false) => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const reply = withReply ? replyText[questionId] : null;

      if (withReply && !reply?.trim()) {
        alert('Please enter a reply');
        setLoading(false);
        return;
      }

      const updateData: any = {
        status: 'approved',
        reviewed_by: authData.user?.id,
        reviewed_at: new Date().toISOString(),
      };

      if (withReply && reply) {
        updateData.admin_reply = reply;
        updateData.admin_replied_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('project_questions')
        .update(updateData)
        .eq('id', questionId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'question_approved',
        title: 'Question Approved',
        message: withReply
          ? 'Your question has been approved and answered by admin'
          : 'Your question has been approved and is now visible',
        link: `/project/${projectId}`,
        read: false,
      });

      alert(withReply ? 'Question approved with reply!' : 'Question approved!');
      setReplyText({ ...replyText, [questionId]: '' });
      loadPendingQuestions();
    } catch (error) {
      console.error('Error approving question:', error);
      alert('Failed to approve question');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (questionId: string, userId: string) => {
    const reason = prompt('Please enter rejection reason (optional):');
    if (reason === null) return;

    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('project_questions')
        .update({
          status: 'rejected',
          reviewed_by: authData.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      if (error) throw error;

      if (reason) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'question_rejected',
          title: 'Question Not Approved',
          message: `Your question was not approved. ${reason ? 'Reason: ' + reason : ''}`,
          link: '/dashboard',
          read: false,
        });
      }

      alert('Question rejected');
      loadPendingQuestions();
    } catch (error) {
      console.error('Error rejecting question:', error);
      alert('Failed to reject question');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Questions</h2>
          <p className="text-gray-600 mt-1">Review, approve, and respond to user questions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <Clock className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-orange-900">{pendingQuestions.length} Pending</span>
        </div>
      </div>

      {pendingQuestions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No pending questions to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingQuestions.map((question) => (
            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-bold text-sm">
                    {getInitials(question.user?.full_name || 'User')}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {getInitials(question.user?.full_name || 'User')}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-600">
                      {new Date(question.created_at).toLocaleDateString()} at{' '}
                      {new Date(question.created_at).toLocaleTimeString()}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      Pending Review
                    </span>
                  </div>

                  <p className="text-gray-900 mb-3">{question.question}</p>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      Project: <span className="font-medium text-gray-900">{question.project?.title}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      User: <span className="font-medium text-gray-900">{question.user?.full_name}</span> ({question.user?.email})
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Reply className="w-4 h-4" />
                      Admin Reply (Optional)
                    </label>
                    <textarea
                      value={replyText[question.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [question.id]: e.target.value })}
                      placeholder="Enter your response to this question..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2">
                    {replyText[question.id]?.trim() ? (
                      <button
                        onClick={() => handleApprove(question.id, question.user_id, question.project_id, true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Approve & Reply
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(question.id, question.user_id, question.project_id, false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(question.id, question.user_id)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
