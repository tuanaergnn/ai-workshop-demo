import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const PORT = process.env.PORT || 3000;

// 1. Interviewer Soru Üretici Endpoint
app.post('/api/interview/questions', async (req, res) => {
  try {
    const { interviewerTitle, interviewType, candidateRole, companyContext } = req.body;
    
    const prompt = `Sen profesyonel bir İK ve Kariyer Koçusun.
Adayın hedef pozisyonu: "${candidateRole || 'Genel'}"
Mülakatı gerçekleştirecek kişinin unvanı/pozisyonu: "${interviewerTitle}"
Mülakat türü: "${interviewType || 'Genel / Teknik / Davranışsal'}"
Şirket/Sektör bağlamı: "${companyContext || 'Genel kurumsal'}"

Bu unvana ve mülakat türüne sahip bir mülakatçının adaya sorabileceği en kritik, derinlemesine ve stratejik potansiyel 6-8 adet mülakat sorusunu üret.
Her soru için şunları belirt:
1. Soru metni
2. Bu soruyla mülakatçının neyi ölçmek/değerlendirmek istediği (Neden soruyor?)
3. İdeal cevap yaklaşımı veya STAR metodolojisi ipucu
4. Kaçınılması gereken yaygın tuzaklar

Yanıtı JSON formatında döndür.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerProfileSummary: {
              type: Type.STRING,
              description: "Mülakatçının bakış açısı ve önceliklerinin özeti"
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Teknik, Davranışsal, Kültür vb." },
                  whatTheyLookFor: { type: Type.STRING },
                  idealApproach: { type: Type.STRING },
                  pitfalls: { type: Type.STRING }
                },
                required: ["id", "question", "category", "whatTheyLookFor", "idealApproach", "pitfalls"]
              }
            }
          },
          required: ["interviewerProfileSummary", "questions"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: unknown) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: (error as Error).message || 'Sorular üretilirken bir hata oluştu.' });
  }
});

// 2. Eğitim & Yol Haritası Danışmanı Endpoint
app.post('/api/training/recommendations', async (req, res) => {
  try {
    const { completedTrainings, currentRole, careerGoal, additionalNotes } = req.body;

    const prompt = `Sen kıdemli bir Kariyer ve Eğitim Koçusun.
Adayın mevcut rolü/durumu: "${currentRole || 'Belirtilmedi'}"
Hedeflenen kariyer noktası: "${careerGoal || 'Belirtilmedi'}"
Tamamladığı eğitimler ve içerikleri:
"""
${completedTrainings}
"""
Ek notlar: "${additionalNotes || 'Yok'}"

Bu adayın mevcut eğitim geçmişini ve içeriklerini analiz ederek, kariyer hedefine ulaşması için bir sonraki adımda alması gereken eğitimleri, sertifikaları ve yetkinlik gelişim planını çıkar.
Şunları detaylandır:
1. Mevcut eğitimlerin güçlü yönleri ve analizi
2. Eksik kalan beceriler (Skill Gap)
3. Alınması gereken önerilen eğitimler / kurslar / sertifikalar (Öncelik sırasına göre)
4. Bu eğitimlerin kariyerine somut katkısı

Yanıtı JSON formatında döndür.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisSummary: { type: Type.STRING },
            skillGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedTrainings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING, description: "Yüksek, Orta, Düşük" },
                  providerType: { type: Type.STRING, description: "Online Kurs, Sertifika, Atölye vb." },
                  description: { type: Type.STRING },
                  expectedOutcome: { type: Type.STRING }
                },
                required: ["title", "priority", "providerType", "description", "expectedOutcome"]
              }
            },
            actionPlan: { type: Type.STRING }
          },
          required: ["analysisSummary", "skillGaps", "recommendedTrainings", "actionPlan"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: unknown) {
    console.error('Error generating training recommendations:', error);
    res.status(500).json({ error: (error as Error).message || 'Eğitim önerileri üretilirken bir hata oluştu.' });
  }
});

// 3. Simüle Mülakat Pratik ve Cevap Değerlendirme Endpoint
app.post('/api/interview/simulate', async (req, res) => {
  try {
    const { question, userAnswer, interviewerTitle } = req.body;

    const prompt = `Sen profesyonel bir mülakatçısın ve Kariyer Koçusun.
Mülakatçının Unvanı: "${interviewerTitle || 'Yönetici'}"
Soru: "${question}"
Adayın Verdiği Cevap: "${userAnswer}"

Bu cevabı profesyonel bir bakış açısıyla değerlendir:
1. Puan ver (0 ile 100 arasında).
2. Güçlü yönler (Neyi çok iyi ifade etti?).
3. Geliştirilmesi gereken alanlar (Neler eksikti veya zayıftı?).
4. Daha iyi, etkileyici ve STAR metodolojisine uygun örnek bir cevap revizyonu sun.

Yanıtı JSON formatında döndür.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "0 ile 100 arası puan" },
            strengths: { type: Type.STRING },
            improvements: { type: Type.STRING },
            revisedAnswerExample: { type: Type.STRING }
          },
          required: ["score", "strengths", "improvements", "revisedAnswerExample"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: unknown) {
    console.error('Error simulating interview:', error);
    res.status(500).json({ error: (error as Error).message || 'Cevap değerlendirilirken bir hata oluştu.' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
