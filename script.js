// URL du backend (Render)
const BACKEND_URL = "https://jarvis-backend-02yu.onrender.com/poser_question";

// Fonction pour afficher un message
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

    if (type === "assistant") lireRéponse(message);
}

// Poser une question
async function poserQuestion() {
    const questionInput = document.getElementById("question");
    const question = questionInput.value.trim();
    if (!question) return;

    afficherMessage(question, "user");
    questionInput.value = "";

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: question }),
        });
        if (!response.ok) throw new Error("Erreur réseau");
        const data = await response.json();
        afficherMessage(data.réponse, "assistant");
    } catch (error) {
        afficherMessage("Désolé, je n'ai pas pu traiter ta question.", "assistant");
    }
}

// Reconnaissance vocale
function demarrerReconnaissanceVocale() {
    const micBtn = document.getElementById("mic-btn");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        afficherMessage("Reconnaissance vocale non supportée.", "assistant");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    micBtn.classList.add("listening");
    recognition.start();
    recognition.onresult = (e) => {
        document.getElementById("question").value = e.results[0][0].transcript;
        poserQuestion();
        micBtn.classList.remove("listening");
    };
    recognition.onerror = () => {
        afficherMessage("Erreur de reconnaissance vocale.", "assistant");
        micBtn.classList.remove("listening");
    };
}

// Lire à voix haute
function lireRéponse(texte) {
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = "fr-FR";
    window.speechSynthesis.speak(utterance);
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("question").addEventListener("keypress", (e) => {
        if (e.key === "Enter") poserQuestion();
    });
    afficherMessage("Bonjour ! Je suis JARVIS. Comment puis-je t'aider ?", "assistant");
});
