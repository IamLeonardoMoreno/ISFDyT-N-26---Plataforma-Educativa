
// Mock Service - No external API dependencies

export const generateTutorResponse = async (question: string, subject: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `**Respuesta del Tutor Virtual (Simulado):**

Entiendo que tienes una consulta sobre **${subject}**.
Basado en tu pregunta: "_${question}_"

Aquí tienes una explicación general:
1.  El concepto clave es fundamental para entender la materia.
2.  Recuerda revisar la bibliografía sugerida en el plan de estudios.
3.  Intenta relacionar esto con los temas vistos la semana pasada.

¡Sigue estudiando así! Si necesitas más detalles, no dudes en preguntar.`;
};

export const generateLessonPlan = async (topic: string, gradeLevel: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return `**Planificación Generada (Simulada)**

**Tema:** ${topic}
**Nivel:** ${gradeLevel}

### 1. Objetivos de Aprendizaje
*   Comprender los conceptos fundamentales de ${topic}.
*   Aplicar la teoría en situaciones prácticas.
*   Fomentar el pensamiento crítico.

### 2. Actividad de Inicio (10 min)
*   **Lluvia de ideas:** Preguntar a los alumnos qué saben sobre el tema.
*   Presentación de un video corto introductorio.

### 3. Desarrollo (40 min)
*   Explicación teórica con soporte visual (diapositivas/pizarrón).
*   **Actividad Grupal:** Dividir la clase en grupos de 4 para resolver un caso práctico.
*   Puesta en común de los resultados.

### 4. Cierre (10 min)
*   Repaso de los puntos clave.
*   Ticket de salida: Una pregunta breve para verificar la comprensión.

### 5. Recursos
*   Proyector, pizarrón, fotocopias del caso práctico.`;
};

export const analyzeInstitutionalData = async (dataDescription: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  
    return `**Informe Ejecutivo de Análisis Institucional (Simulado)**

**1. Análisis de Situación:**
Basado en los datos proporcionados, se observa una **estabilidad general** en la matrícula (450 alumnos), aunque el **ausentismo en 5to año** ha mostrado un incremento preocupante del 15%. El rendimiento en el ciclo básico, especialmente en Matemáticas, requiere atención inmediata dado el promedio de 5.5.

**2. Identificación de Patrones:**
Existe una correlación potencial entre la baja en el rendimiento de 2do año y la adaptación a las exigencias del nivel. Por otro lado, la retención escolar global se mantiene en niveles aceptables (88% de asistencia promedio), lo cual es un indicador positivo de la salud institucional general.

**3. Recomendaciones Estratégicas:**
*   **Intervención Pedagógica:** Implementar talleres de apoyo en Matemáticas para 2do año a contraturno.
*   **Seguimiento de Asistencia:** Activar un protocolo de contacto temprano con las familias de los alumnos de 5to año con más de 3 faltas consecutivas.
*   **Comunicación:** Reforzar los canales digitales para mantener informados a los padres y reducir la percepción negativa sobre la comunicación institucional.`;
  };
