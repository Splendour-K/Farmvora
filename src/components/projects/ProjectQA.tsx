import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Send, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  admin_reply: string | null;
  admin_replied_at: string | null;
  status: string;
  user: {
    full_name: string;
  };
  answerer?: {
    full_name: string;
  } | null;
}

interface ProjectQAProps {
  projectId: string;
}

export function ProjectQA({ projectId }: ProjectQAProps) {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    loadQuestions();
  }, [projectId]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('project_questions')
        .select(`
          *,
          user:profiles!project_questions_user_id_fkey(full_name),
          answerer:profiles!project_questions_answered_by_fkey(full_name)
        `)
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false});

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
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

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuestion.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from('project_questions').insert({
        project_id: projectId,
        user_id: user.id,
        question: newQuestion.trim(),
      });

      if (error) throw error;

      setNewQuestion('');
      alert('Question submitted for review. It will appear once approved by admin.');
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!user || !answerText.trim() || profile?.role !== 'admin') return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('project_questions')
        .update({
          answer: answerText.trim(),
          answered_by: user.id,
          answered_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      if (error) throw error;

      setAnsweringId(null);
      setAnswerText('');
      loadQuestions();
      alert('Answer submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Questions & Answers</h2>
      </div>

      {user && (
        <form onSubmit={handleSubmitQuestion} className="mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask a question about this project
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !newQuestion.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Ask
              </button>
            </div>
          </div>
        </form>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="border-l-4 border-green-600 pl-4 py-2">
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{q.question}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Asked by {getInitials(q.user.full_name)} • {getTimeAgo(q.created_at)}
                    </p>
                  </div>
                  {(q.admin_reply || q.answer) && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Answered
                    </span>
                  )}
                </div>
              </div>

              {q.admin_reply ? (
                <div className="bg-green-50 rounded-lg p-4 mt-3">
                  <p className="text-gray-900 mb-2">{q.admin_reply}</p>
                  <p className="text-sm text-gray-600">
                    Answered by Admin • {q.admin_replied_at && getTimeAgo(q.admin_replied_at)}
                  </p>
                </div>
              ) : q.answer ? (
                <div className="bg-green-50 rounded-lg p-4 mt-3">
                  <p className="text-gray-900 mb-2">{q.answer}</p>
                  <p className="text-sm text-gray-600">
                    Answered by {q.answerer?.full_name} • {q.answered_at && getTimeAgo(q.answered_at)}
                  </p>
                </div>
              ) : profile?.role === 'admin' ? (
                answeringId === q.id ? (
                  <div className="mt-3">
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your answer..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitAnswer(q.id)}
                        disabled={submitting || !answerText.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        {submitting ? 'Submitting...' : 'Submit Answer'}
                      </button>
                      <button
                        onClick={() => {
                          setAnsweringId(null);
                          setAnswerText('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAnsweringId(q.id)}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 font-semibold"
                  >
                    Answer this question
                  </button>
                )
              ) : (
                <p className="text-sm text-gray-500 italic mt-2">Awaiting answer from project team</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
