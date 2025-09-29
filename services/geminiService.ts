import { GoogleGenAI, Type } from "@google/genai";
import { GeneratorType, PromptState } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const promptSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING, description: 'El sujeto, personaje u objeto principal. Sé muy descriptivo y específico.' },
    action: { type: Type.STRING, description: 'La acción que el sujeto está realizando o la escena que está ocurriendo.' },
    style: { type: Type.STRING, description: 'El estilo visual o artístico. Ejemplos: Cinematográfico, Fotorrealista, Pintura al óleo, Anime de los 90, Cyberpunk.' },
    composition: { type: Type.STRING, description: 'El encuadre, ángulo y composición. Ejemplos: Primer plano extremo, Gran plano general, Contrapicado, Regla de los tercios.' },
    lighting: { type: Type.STRING, description: 'El esquema y la calidad de la iluminación. Ejemplos: Iluminación de borde (Rim lighting), Hora dorada, Luz de neón, Claro oscuro, Volumétrica.' },
    details: { type: Type.STRING, description: 'Detalles finos, texturas y calidad general. Ejemplos: Intrincado, Muy detallado, 8K, Textura de tela rugosa.' },
    weather: { type: Type.STRING, description: 'Las condiciones climáticas y la atmósfera. Ejemplos: Tormenta eléctrica con relámpagos, Niebla densa al amanecer, Atardecer melancólico.' },
    camera: { type: Type.STRING, description: 'El tipo de cámara, lente o perspectiva específica. Ejemplos: Lente anamórfica, Teleobjetivo, Ojo de pez, Vista de dron.' },
    depthOfField: { type: Type.STRING, description: 'El efecto de profundidad de campo. Ejemplos: Bokeh suave y cremoso, Profundidad de campo reducida, Enfoque nítido en todo.' },
    motion: { type: Type.STRING, description: '(SOLO PARA VIDEO) El movimiento de la cámara o de la escena. Ejemplos: Paneo lento, Travelling rápido, Time-lapse de nubes.' },
  },
  required: ['subject']
};

export const enhancePrompt = async (prompt: string, type: GeneratorType): Promise<PromptState> => {
  try {
    const systemInstruction = `Eres un director de fotografía y un ingeniero de prompts de clase mundial para IA generativa. Tu tarea es transformar una idea de usuario simple en un prompt de nivel profesional, excepcionalmente detallado y evocador. Analiza la idea del usuario y rellena los campos del JSON con la mayor cantidad de matices y detalles creativos posible para producir un resultado visualmente impactante. Piensa en la emoción, la atmósfera, la textura y la narrativa. No te limites a palabras clave; usa frases descriptivas. Si el tipo es 'video', asegúrate de rellenar el campo 'motion'. Si es 'image', puedes dejar 'motion' vacío. Devuelve tu respuesta únicamente como un objeto JSON estructurado que se ajuste al esquema proporcionado.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analiza y transforma esta idea para un tipo '${type}': "${prompt}"`,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: promptSchema
        }
    });

    const jsonText = response.text.trim();
    const enhancedPromptObject = JSON.parse(jsonText);
    
    // Ensure the object has all the keys from PromptState to avoid runtime errors
    const completePromptState: PromptState = {
        subject: enhancedPromptObject.subject || '',
        action: enhancedPromptObject.action || '',
        style: enhancedPromptObject.style || '',
        composition: enhancedPromptObject.composition || '',
        lighting: enhancedPromptObject.lighting || '',
        details: enhancedPromptObject.details || '',
        weather: enhancedPromptObject.weather || '',
        camera: enhancedPromptObject.camera || '',
        depthOfField: enhancedPromptObject.depthOfField || '',
        motion: enhancedPromptObject.motion || '',
    };
    
    return completePromptState;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Error al mejorar el prompt con IA. La respuesta del modelo podría no ser un JSON válido.");
  }
};


export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No se generó ninguna imagen.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Error al generar la imagen. Por favor, revisa la consola para más detalles.");
  }
};


export const generateVideo = async (prompt: string, onProgress: (message: string) => void): Promise<string> => {
    try {
        onProgress("Iniciando la generación del video...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });

        onProgress("Tu video se está creando... Esto puede tardar unos minutos.");
        let checks = 0;
        
        while (!operation.done) {
            checks++;
            const progressMessages = [
                "Analizando el prompt y esbozando escenas...",
                "Renderizando fotogramas de alta fidelidad...",
                "Componiendo pistas de video y audio...",
                "Aplicando efectos visuales finales...",
                "Casi listo, puliendo el corte final..."
            ];
            const messageIndex = Math.min(checks - 1, progressMessages.length - 1);
            onProgress(progressMessages[messageIndex]);
            
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (downloadLink) {
            onProgress("Descargando tu video generado...");
            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!response.ok) {
                throw new Error(`Error al descargar el video: ${response.statusText}`);
            }
            const videoBlob = await response.blob();
            return URL.createObjectURL(videoBlob);
        } else {
            throw new Error("La generación del video se completó, pero no se encontró un enlace de descarga.");
        }
    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Error al generar el video. Por favor, revisa la consola para más detalles.");
    }
};