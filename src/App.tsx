/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Clock, 
  Send,
  HelpCircle,
  BookmarkCheck,
  TrendingUp,
  UserCheck,
  GraduationCap
} from 'lucide-react';

interface QuestionItem {
  id: string;
  question: string;
  category: string;
  whatTheyLookFor: string;
  idealApproach: string;
  pitfalls: string;
}

interface InterviewResponse {
  interviewerProfileSummary: string;
  questions: QuestionItem[];
}

interface TrainingRec {
  title: string;
  priority: string;
  providerType: string;
  description: string;
  expectedOutcome: string;
}

interface TrainingResponse {
  analysisSummary: string;
  skillGaps: string[];
  recommendedTrainings: TrainingRec[];
  actionPlan: string;
}

interface SimulationResponse {
  score: number;
  strengths: string;
  improvements: string;
  revisedAnswerExample: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'interview' | 'training' | 'practice' | 'saved'>('interview');
  
  // Tab 1 States (Interview Questions)
  const [interviewerTitle, setInterviewerTitle] = useState('CTO & Yazılım Direktörü');
  const [candidateRole, setCandidateRole] = useState('Kıdemli Frontend Mühendisi');
  const [interviewType, setInterviewType] = useState('Teknik ve Mimari Liderlik');
  const [companyContext, setCompanyContext] = useState('Büyümekte olan global fintech şirketi');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewResponse | null>(null);

  // Tab 2 States (Training & Roadmap)
  const [currentRole, setCurrentRole] = useState('Junior Yazılımcı');
  const [careerGoal, setCareerGoal] = useState('Tech Lead / Kıdemli Mimari Lider');
  const [completedTrainings, setCompletedTrainings] = useState(
    '1. Temel JavaScript ve ES6+ Eğitimi (40 saat)\n2. React ile Web Geliştirme Temelleri (Udemy - 30 saat)\n3. Git ve Versiyon Kontrol Sistemleri Atölyesi (10 saat)'
  );
  const [additionalNotes, setAdditionalNotes] = useState('Özellikle sistem tasarımı, ölçeklenebilirlik ve ekip yönetimi konularında kendimi geliştirmek istiyorum.');
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [trainingData, setTrainingData] = useState<TrainingResponse | null>(null);

  // Tab 3 States (Mock Interview Practice)
  const [selectedQuestionForPractice, setSelectedQuestionForPractice] = useState('');
  const [practiceQuestionInput, setPracticeQuestionInput] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);

  // Saved / History items
  const [savedItems, setSavedItems] = useState<{ type: string; title: string; date: string; data: any }[]>([]);

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewerTitle, interviewType, candidateRole, companyContext })
      });
      const data = await res.json();
      if (res.ok) {
        setInterviewData(data);
        setSavedItems(prev => [{
          type: 'Mülakat Soruları',
          title: `${interviewerTitle} (${candidateRole})`,
          date: new Date().toLocaleDateString('tr-TR'),
          data
        }, ...prev]);
      } else {
        alert(data.error || 'Bir hata oluştu');
      }
    } catch (err) {
      console.error(err);
      alert('Sunucu bağlantı hatası.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleGenerateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTraining(true);
    try {
      const res = await fetch('/api/training/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedTrainings, currentRole, careerGoal, additionalNotes })
      });
      const data = await res.json();
      if (res.ok) {
        setTrainingData(data);
        setSavedItems(prev => [{
          type: 'Eğitim Yol Haritası',
          title: `${currentRole} -> ${careerGoal}`,
          date: new Date().toLocaleDateString('tr-TR'),
          data
        }, ...prev]);
      } else {
        alert(data.error || 'Bir hata oluştu');
      }
    } catch (err) {
      console.error(err);
      alert('Sunucu bağlantı hatası.');
    } finally {
      setLoadingTraining(false);
    }
  };

  const handleSimulateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const qToUse = selectedQuestionForPractice || practiceQuestionInput;
    if (!qToUse || !userAnswer) {
      alert('Lütfen bir soru seçin/yazın ve cevabınızı girin.');
      return;
    }
    setSimulating(true);
    setSimulationResult(null);
    try {
      const res = await fetch('/api/interview/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: qToUse, userAnswer, interviewerTitle })
      });
      const data = await res.json();
      if (res.ok) {
        setSimulationResult(data);
      } else {
        alert(data.error || 'Bir hata oluştu');
      }
    } catch (err) {
      console.error(err);
      alert('Sunucu bağlantı hatası.');
    } finally {
      setSimulating(false);
    }
  };

  const loadPresetQuestion = (q: string) => {
    setSelectedQuestionForPractice(q);
    setPracticeQuestionInput(q);
    setActiveTab('practice');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-8 shadow-xs">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-950 block">KariyerKoç AI</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Akıllı Mülakat & Eğitim Danışmanı</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('interview')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${activeTab === 'interview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            Mülakat Soru Üretici
          </button>
          <button 
            onClick={() => setActiveTab('training')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${activeTab === 'training' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            Eğitim & Yol Haritası
          </button>
          <button 
            onClick={() => setActiveTab('practice')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${activeTab === 'practice' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            Simüle Mülakat Pratiği
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${activeTab === 'saved' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            Geçmiş Oturumlar ({savedItems.length})
          </button>
        </nav>

        {/* Primary Action / Status */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('interview')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            Yeni Mülakat Analizi
          </button>
        </div>
      </header>

      {/* Mobile Nav Subbar */}
      <div className="flex md:hidden bg-white border-b border-slate-200 px-4 py-2 gap-2 overflow-x-auto text-xs font-medium">
        <button 
          onClick={() => setActiveTab('interview')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'interview' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'}`}
        >
          Mülakat Soruları
        </button>
        <button 
          onClick={() => setActiveTab('training')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'training' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'}`}
        >
          Eğitim Analizi
        </button>
        <button 
          onClick={() => setActiveTab('practice')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'practice' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'}`}
        >
          Pratik
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'saved' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'}`}
        >
          Geçmiş ({savedItems.length})
        </button>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
        
        {/* TAB 1: INTERVIEW QUESTIONS */}
        {activeTab === 'interview' && (
          <div className="space-y-8">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-2 block">Mülakatçı Profili & Soru Üretici</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mülakatçının Gözünden Potansiyel Sorular</h1>
              <p className="text-slate-600 mt-2">
                Karşınızdaki mülakatçının unvanını ve şirket bağlamını girin; yapay zeka bu kişinin en çok önem verdiği kriterleri analiz ederek size nokta atışı sorular, beklentiler ve ideal cevap stratejileri üretsin.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Input Card */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <form onSubmit={handleGenerateQuestions} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Mülakatçının Unvanı / Rolü
                    </label>
                    <input 
                      type="text" 
                      value={interviewerTitle} 
                      onChange={(e) => setInterviewerTitle(e.target.value)}
                      placeholder="Örn: CTO, İK Direktörü, Ürün Müdürü"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Sizin Hedef Rolünüz
                    </label>
                    <input 
                      type="text" 
                      value={candidateRole} 
                      onChange={(e) => setCandidateRole(e.target.value)}
                      placeholder="Örn: Kıdemli Yazılımcı, Pazarlama Uzmanı"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Mülakat Türü / Odak
                    </label>
                    <input 
                      type="text" 
                      value={interviewType} 
                      onChange={(e) => setInterviewType(e.target.value)}
                      placeholder="Örn: Teknik, Kültür Uyum, Davranışsal"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Şirket & Sektör Bağlamı (İsteğe bağlı)
                    </label>
                    <textarea 
                      value={companyContext} 
                      onChange={(e) => setCompanyContext(e.target.value)}
                      rows={3}
                      placeholder="Örn: Hızlı büyüyen fintech startup'ı, kurumsal holding vb."
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loadingQuestions}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingQuestions ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sorular ve Analiz Üretiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>Soruları ve Beklentileri Üret</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Results View */}
              <div className="lg:col-span-7 space-y-6">
                {!interviewData && !loadingQuestions && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">Henüz soru üretilmedi</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      Sol taraftaki formu doldurarak mülakatçının muhtemel sorularını ve zihin haritasını hemen oluşturun.
                    </p>
                  </div>
                )}

                {loadingQuestions && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-medium text-slate-700">Mülakatçının profili analiz ediliyor ve sorular hazırlanıyor...</p>
                  </div>
                )}

                {interviewData && (
                  <div className="space-y-6">
                    {/* Profile Summary Card */}
                    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                        <UserCheck className="w-4 h-4" />
                        <span>Mülakatçı Zihin Analizi ({interviewerTitle})</span>
                      </div>
                      <p className="text-slate-100 text-sm leading-relaxed">
                        {interviewData.interviewerProfileSummary}
                      </p>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span>Potansiyel Mülakat Soruları ({interviewData.questions.length})</span>
                      </h3>

                      {interviewData.questions.map((q, idx) => (
                        <div key={q.id || idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                <span className="font-semibold text-indigo-600">Soru #{idx + 1}</span>
                                <span aria-hidden="true">·</span>
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{q.category}</span>
                              </div>
                              <h4 className="text-base font-bold text-slate-900 mt-1">{q.question}</h4>
                            </div>
                            <button 
                              onClick={() => loadPresetQuestion(q.question)}
                              className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
                            >
                              <span>Simüle Et</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                              <span className="font-semibold text-slate-900 block mb-1 flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-indigo-600" />
                                Neyi Ölçmek İstiyor?
                              </span>
                              <p className="text-slate-600 leading-relaxed">{q.whatTheyLookFor}</p>
                            </div>
                            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                              <span className="font-semibold text-emerald-900 block mb-1 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                İdeal Cevap Yaklaşımı
                              </span>
                              <p className="text-emerald-800 leading-relaxed">{q.idealApproach}</p>
                            </div>
                          </div>

                          <div className="mt-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-xs">
                            <span className="font-semibold text-amber-900 block mb-0.5 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              Kaçınılması Gereken Tuzaklar:
                            </span>
                            <p className="text-amber-800">{q.pitfalls}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRAINING & ROADMAP */}
        {activeTab === 'training' && (
          <div className="space-y-8">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-2 block">Eğitim ve Yol Haritası Danışmanı</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bir Sonraki Adım İçin Hangi Eğitimi Almalısınız?</h1>
              <p className="text-slate-600 mt-2">
                Katıldığınız kursları, aldığınız eğitimleri ve içeriklerini bize iletin; yapay zeka kariyer hedefinizdeki eksikleri (skill gap) analiz ederek size en doğru sonraki eğitim rotasını çizersin.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Input Card */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <form onSubmit={handleGenerateTraining} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Mevcut Rolünüz / Durumunuz
                    </label>
                    <input 
                      type="text" 
                      value={currentRole} 
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="Örn: Junior Frontend Developer"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Hedeflediğiniz Rol / Pozisyon
                    </label>
                    <input 
                      type="text" 
                      value={careerGoal} 
                      onChange={(e) => setCareerGoal(e.target.value)}
                      placeholder="Örn: Senior Software Architect"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Katıldığınız Eğitimler ve İçerikleri
                    </label>
                    <textarea 
                      value={completedTrainings} 
                      onChange={(e) => setCompletedTrainings(e.target.value)}
                      rows={6}
                      placeholder="Aldığınız kursları, sertifikaları ve öğrendiğiniz konuları buraya yazın..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50 resize-y font-mono text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Özel Notlar veya Beklentiler (İsteğe bağlı)
                    </label>
                    <textarea 
                      value={additionalNotes} 
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      rows={2}
                      placeholder="Örn: Pratik projelere mi, teorik temellere mi ağırlık vermek istiyorsunuz?"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loadingTraining}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingTraining ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Eğitim Analizi Yapılıyor...</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        <span>Sonraki Eğitim Yol Haritasını Çıkar</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Results View */}
              <div className="lg:col-span-7 space-y-6">
                {!trainingData && !loadingTraining && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">Henüz eğitim analizi yapılmadı</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      Sol taraftaki forma katıldığınız eğitimleri girerek eksiklerinizi ve sonraki adımda almanız gereken kursları keşfedin.
                    </p>
                  </div>
                )}

                {loadingTraining && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-medium text-slate-700">Eğitim içerikleriniz inceleniyor ve kariyer yol haritası oluşturuluyor...</p>
                  </div>
                )}

                {trainingData && (
                  <div className="space-y-6">
                    {/* Analysis Summary */}
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Mevcut Durum ve Beceri Boşluğu (Skill Gap) Analizi</span>
                      </div>
                      <p className="text-slate-100 text-sm leading-relaxed mb-4">
                        {trainingData.analysisSummary}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                        <span className="text-xs text-indigo-200 font-semibold self-center mr-1">Tespit Edilen Eksik Yetkinlikler:</span>
                        {trainingData.skillGaps.map((gap, i) => (
                          <span key={i} className="bg-indigo-900/60 text-indigo-200 text-xs px-2.5 py-1 rounded-md border border-indigo-700/50">
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Trainings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        Almanız Gereken Sonraki Eğitimler ve Sertifikalar
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        {trainingData.recommendedTrainings.map((rec, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                  <span className="font-semibold text-indigo-600">Öneri #{idx + 1}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{rec.providerType}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className={`px-2 py-0.5 rounded font-medium ${rec.priority === 'Yüksek' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                                    Öncelik: {rec.priority}
                                  </span>
                                </div>
                                <h4 className="text-base font-bold text-slate-900 mt-1">{rec.title}</h4>
                              </div>
                            </div>

                            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{rec.description}</p>

                            <div className="mt-4 pt-3 border-t border-slate-100 bg-emerald-50/50 p-3 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                              <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block mb-0.5">Kariyerinize Somut Katkısı:</span>
                                <p className="text-emerald-800">{rec.expectedOutcome}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Plan */}
                      <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-6">
                        <h4 className="text-sm font-bold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                          Harekete Geçirici Eylem Planı (Action Plan)
                        </h4>
                        <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-line">
                          {trainingData.actionPlan}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MOCK INTERVIEW PRACTICE */}
        {activeTab === 'practice' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div>
              <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-2 block">İnteraktif Pratik Asistanı</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Simüle Mülakat ve Cevap Değerlendirme</h1>
              <p className="text-slate-600 mt-2">
                Bir mülakat sorusuna yanıtınızı yazın; yapay zeka cevabınızı puanlasın, güçlü ve zayıf yönlerinizi analiz etsin ve ideal STAR metodolojisine uygun örnek bir revizyon sunsun.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
              <form onSubmit={handleSimulateAnswer} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Mülakat Sorusu
                  </label>
                  <textarea 
                    value={practiceQuestionInput} 
                    onChange={(e) => {
                      setPracticeQuestionInput(e.target.value);
                      setSelectedQuestionForPractice(e.target.value);
                    }}
                    rows={2}
                    placeholder="Mülakat sorusunu buraya yazın veya Soru Üretici sekmesinden bir soru seçin..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50 resize-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Sizin Cevabınız (Deneyiminiz veya Yaklaşımınız)
                  </label>
                  <textarea 
                    value={userAnswer} 
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={6}
                    placeholder="Bu soruya mülakatta vereceğiniz cevabı buraya detaylıca yazın (Durum, Görev, Eylem, Sonuç - STAR yöntemini kullanabilirsiniz)..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50 resize-y"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={simulating}
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {simulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Cevap Değerlendiriliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-indigo-400" />
                        <span>Cevabımı Değerlendir & Puanla</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Simulation Result */}
              {simulationResult && (
                <div className="mt-8 pt-6 border-t border-slate-200 space-y-6">
                  <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl p-6">
                    <div>
                      <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider block mb-1">Mülakat Simülasyonu Sonucu</span>
                      <h3 className="text-xl font-bold">Cevap Performans Raporu</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-indigo-400">{simulationResult.score}</span>
                      <span className="text-xs text-slate-400 block">/ 100 Puan</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
                      <h4 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Güçlü Yönler
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed">{simulationResult.strengths}</p>
                    </div>

                    <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100">
                      <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Geliştirilmesi Gerekenler
                      </h4>
                      <p className="text-xs text-amber-800 leading-relaxed">{simulationResult.improvements}</p>
                    </div>
                  </div>

                  <div className="bg-indigo-50/60 p-6 rounded-2xl border border-indigo-100">
                    <h4 className="text-sm font-bold text-indigo-950 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      İdeal Revize Edilmiş Cevap Örneği (STAR Metodolojisi)
                    </h4>
                    <p className="text-xs text-indigo-900 leading-relaxed whitespace-pre-line font-medium">
                      {simulationResult.revisedAnswerExample}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SAVED SESSIONS */}
        {activeTab === 'saved' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-2 block">Arşiv & Geçmiş</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Geçmiş Oturumlar ve Raporlar</h1>
              <p className="text-slate-600 mt-2">
                Bu oturum boyunca ürettiğiniz mülakat soru setleri ve eğitim yol haritaları burada saklanır.
              </p>
            </div>

            {savedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">Henüz kayıtlı oturum yok</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Mülakat soruları veya eğitim analizi ürettikçe burada listelenecektir.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-indigo-600">{item.type}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <button 
                      onClick={() => {
                        if (item.type === 'Mülakat Soruları') {
                          setInterviewData(item.data);
                          setActiveTab('interview');
                        } else {
                          setTrainingData(item.data);
                          setActiveTab('training');
                        }
                      }}
                      className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap"
                    >
                      İncele / Görüntüle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 KariyerKoç AI. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 cursor-pointer">Gizlilik Politikası</span>
            <span className="hover:text-slate-900 cursor-pointer">Kullanım Koşulları</span>
            <span className="hover:text-slate-900 cursor-pointer">Destek</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
