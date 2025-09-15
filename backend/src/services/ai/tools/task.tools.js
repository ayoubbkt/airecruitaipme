// src/services/ai/tools/task.tools.js
import TaskService from '../../../api/tasks/task.service.js'; // Supposons que vous ayez un TaskService

// --- Fonction d'exécution ---

export const getTodaysTasks = async ({ userId }) => {
    console.log(`TOOL: Recherche des tâches pour l'utilisateur ${userId}`);
    // Vous devez créer cette méthode. Elle doit retourner les tâches de l'utilisateur pour la journée.
    const tasks = await TaskService.findTodaysTasksByUserId(userId); 
    if (!tasks || tasks.length === 0) {
        return "Vous n'avez aucune tâche planifiée pour aujourd'hui. Profitez de votre journée !";
    }
    return JSON.stringify(tasks);
};


// --- Définition de l'outil pour Gemini ---

export const taskTools = [
    {
        functionDeclarations: [
            {
                name: 'getTodaysTasks',
                description: "Récupère la liste des tâches à réaliser aujourd'hui pour l'utilisateur connecté.",
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        userId: { type: 'STRING', description: "L'ID de l'utilisateur qui fait la demande." },
                    },
                    required: ['userId'],
                },
            },
        ],
    },
];
