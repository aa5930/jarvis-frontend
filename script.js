// URL du backend (à mettre à jour plus tard avec l'URL de Render)
const BACKEND_URL = "http://localhost:8000/poser_question"; // Pour tester en local

// Fonction pour afficher un message dans la boîte de chat
function afficherMessage(message, type) {
    const messagesDiv = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);

    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("avatar");
    if (type === "assistant") {
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
    } else {
        avatarDiv.innerHTML = '<i class="fas fa-user"></i>';
    }

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    contentDiv.textContent = message;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Lire la réponse à voix haute si c'est l'assistant
    if (type === "assistant") {
        lireRéponse(message);
    }
}

// Fonction pour poser une question au backend
async function poserQuestion() {
    const questionInput = document.getElementById("question");
    const question = questionInput.value.trim();

    if (!question) {
        return; // Ne rien faire si la question est vide
    }

    // Afficher la question de l'utilisateur
    afficherMessage(question, "user");
    questionInput.value = "";

    try {
        // Envoyer la question au backend
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: question }),
        });

        if (!response.ok) {
            throw new Error("Erreur réseau : " + response.status);
        }

        const data = await response.json();
        afficherMessage(data.réponse, "assistant");
    } catch (error) {
        console.error("Erreur :", error);
        afficherMessage("Désolé, je n'ai pas pu traiter ta question. Vérifie que le backend est lancé.", "assistant");
    }
}

// Fonction pour démarrer la reconnaissance vocale
function demarrerReconnaissanceVocale() {
    const micBtn = document.getElementById("mic-btn");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        afficherMessage("Désolé, la reconnaissance vocale n'est pas supportée par ton navigateur.", "assistant");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Changer l'apparence du bouton micro
    micBtn.classList.add("listening");

    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("question").value = transcript;
        poserQuestion(); // Pose la question automatiquement
        micBtn.classList.remove("listening");
    };

    recognition.onerror = (event) => {
        console.error("Erreur de reconnaissance vocale :", event.error);
        afficherMessage("Désolé, je n'ai pas pu comprendre. Essaie à nouveau.", "assistant");
        micBtn.classList.remove("listening");
    };

    recognition.onend = () => {
        micBtn.classList.remove("listening");
    };
}

// Fonction pour lire une réponse à voix haute
function lireRéponse(texte) {
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = "fr-FR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// Permettre d'envoyer avec la touche Entrée
document.getElementById("question").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        poserQuestion();
    }
});

// Message de bienvenue au chargement de la page
window.onload = () => {
    const bienvenue = "Bonjour ! Je suis JARVIS. Comment puis-je t'aider aujourd'hui ?";
    afficherMessage(bienvenue, "assistant");
};