import { GoogleGenAI } from "@google/genai";
import { Transaction, Member } from "../types";

export const generateFinancialReport = async (
  transactions: Transaction[],
  members: Member[],
  query: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare context data
  const financialContext = JSON.stringify({
    summary: {
      totalMembers: members.length,
      transactionCount: transactions.length,
      totalIncome: transactions.filter(t => t.type === 'ENTREE').reduce((acc, t) => acc + t.amount, 0),
      totalExpense: transactions.filter(t => t.type === 'SORTIE').reduce((acc, t) => acc + t.amount, 0),
    },
    recentTransactions: transactions.slice(0, 20), // Send last 20 for context
  });

  const systemInstruction = `
    Tu es un expert comptable et assistant financier pour une association.
    Tu as accès aux données financières suivantes (format JSON) : ${financialContext}.
    
    Tes tâches :
    1. Analyser les données fournies.
    2. Répondre aux questions sur le solde, les tendances, ou des membres spécifiques.
    3. Générer des brouillons de rapports financiers.
    
    Réponds toujours de manière professionnelle, concise et en français.
    Si on te demande un rapport, structure-le clairement (Titre, Période, Chiffres Clés, Analyse, Conclusion).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Désolé, je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Une erreur est survenue lors de la communication avec l'assistant IA.";
  }
};
