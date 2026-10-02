const $ = (id) => document.getElementById(id);

const esc = (s) =>
    s.replace(
        /[&<>"']/g,
        c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c])
    );


/* ---------- Feature Navigation ---------- */

function openFeature(name) {

    ["chat", "plan", "notes", "career"].forEach(p => {

        $(p + "Section").style.display =
            p === name ? "block" : "none";

    });

    $("result").style.display = "none";

    $(name + "Section").scrollIntoView({
        behavior: "smooth"
    });
}


/* ---------- AI Chat ---------- */

const KB = [

    {
        keys: ["exam", "prepare", "revision", "revise"],
        ans:
            "1. List topics and mark weak ones.\n" +
            "2. Study weak topics first.\n" +
            "3. Solve previous year papers.\n" +
            "4. Revise short notes in the last 2 days.\n" +
            "5. Sleep well before the exam."
    },

    {
        keys: ["focus", "concentrate", "distract", "phone", "lazy"],
        ans:
            "Use Pomodoro: 25 minutes study, 5 minutes break.\n" +
            "Keep your phone away.\n" +
            "Start with just 5 minutes."
    },

    {
        keys: ["memory", "remember", "forget"],
        ans:
            "Revise after 1, 3 and 7 days.\n" +
            "Explain the topic aloud.\n" +
            "Solve questions instead of only re-reading."
    },

    {
        keys: ["time", "schedule", "timetable"],
        ans:
            "Plan tomorrow tonight (3 main tasks).\n" +
            "Study the hardest subject first.\n" +
            "Try the Study Plan feature above."
    },

    {
        keys: ["resume", "cv"],
        ans:
            "A resume needs: contact details, education, 2-3 projects, skills, certificates. Keep it to one page."
    },

    {
        keys: ["interview"],
        ans:
            "Prepare a 1 minute introduction, know your projects well, and practice answers aloud."
    },

    {
        keys: ["coding", "programming", "code", "learn"],
        ans:
            "Pick one language (Python is easy), learn basics, build small projects, and practice daily."
    },

    {
        keys: ["hello", "hi", "hey"],
        ans:
            "Hello! Ask me about exams, focus, memory, resume, interviews or coding."
    }

];


function answer(q) {

    const words = q
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/);

    let best = null;
    let top = 0;

    KB.forEach(item => {

        const score = item.keys.filter(
            k => words.includes(k)
        ).length;

        if (score > top) {
            best = item;
            top = score;
        }

    });

    return best
        ? best.ans
        : "I don't know that yet. Try: exam, focus, memory, time, resume, interview, coding.";
}


/* ---------- Chat History ---------- */

function addChatMessage(question, reply) {

    const box = $("answer");

    const message = document.createElement("div");

    message.className = "chat-message";

    message.innerHTML =
        "<p><strong>👤 You:</strong> " +
        esc(question) +
        "</p>" +

        "<p><strong>🤖 AI:</strong></p>" +

        "<p>" +
        esc(reply).replace(/\n/g, "<br>") +
        "</p>";

    box.appendChild(message);
}


function ask() {

    const q = $("question").value.trim();

    if (!q) {
        return;
    }

    const reply = answer(q);

    addChatMessage(q, reply);

    $("question").value = "";

    $("question").focus();
}


$("askButton").onclick = ask;


$("question").addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {
            ask();
        }

    }
);


/* ---------- Clear Chat History ---------- */

$("clearChat").onclick = () => {

    $("answer").innerHTML = "";

    $("question").value = "";

    $("question").focus();

};


/* ---------- Study Plan ---------- */

$("makePlan").onclick = () => {

    const subjects = $("subjects")
        .value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

    const days = Math.min(
        30,
        Math.max(
            1,
            parseInt($("days").value) || 1
        )
    );


    if (!subjects.length) {

        $("planOut").innerHTML =
            '<p class="warn">Enter at least one subject.</p>';

        return;
    }


    let rows = "";


    for (let d = 1; d <= days; d++) {

        const plan =
            d === days
                ? "Revise all subjects + mock test"
                : subjects[(d - 1) % subjects.length] +
                  " (main) + 30 min revision of yesterday";


        rows +=
            "<tr>" +
            "<td>Day " + d + "</td>" +
            "<td>" + esc(plan) + "</td>" +
            "</tr>";
    }


    $("planOut").innerHTML =
        "<table>" +
        "<tr>" +
        "<th>Day</th>" +
        "<th>Plan</th>" +
        "</tr>" +
        rows +
        "</table>";

};


/* ---------- Notes Summary ---------- */

const STOP = new Set(
    "a an the and or but of to in on at by for with from as is are was were be it this that these those not can will would should may do does has have had into about which who what when where how their them his her our your"
        .split(" ")
);


$("summarize").onclick = () => {

    const text = $("notesText").value.trim();


    const sentences =
        (
            text
                .replace(/\s+/g, " ")
                .match(/[^.!?]+[.!?]*/g) || []
        )
            .map(s => s.trim())
            .filter(
                s => s.split(" ").length >= 4
            );


    if (sentences.length < 3) {

        $("notesOut").innerHTML =
            '<p class="warn">Paste a longer paragraph (at least 3 sentences).</p>';

        return;
    }


    const words = s =>
        (
            s
                .toLowerCase()
                .match(/[a-z0-9]+/g) || []
        )
            .filter(
                w => !STOP.has(w) && w.length > 2
            );


    const freq = {};


    sentences.forEach(s => {

        words(s).forEach(w => {

            freq[w] = (freq[w] || 0) + 1;

        });

    });


    const scored = sentences.map((s, i) => ({

        s,

        i,

        score:
            words(s).reduce(
                (a, w) => a + freq[w],
                0
            ) /
            Math.sqrt(words(s).length || 1)

    }));


    const top = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .sort((a, b) => a.i - b.i);


    $("notesOut").innerHTML =
        "<ul>" +

        top
            .map(
                t =>
                    "<li>" +
                    esc(t.s) +
                    "</li>"
            )
            .join("") +

        "</ul>";

};


/* ---------- Career Helper ---------- */

const CAREERS = {


    /* 1. Web Development */

    web: [
        "Web Development",

        [
            "Learn HTML, CSS and JavaScript",
            "Learn responsive web design",
            "Learn Git and GitHub",
            "Build small frontend projects",
            "Learn React or another frontend framework",
            "Learn backend basics with Node.js",
            "Build 2-3 full-stack projects",
            "Create a professional portfolio",
            "Deploy projects online",
            "Apply for internships and jobs"
        ]
    ],


    /* 2. Data Science & AI */

    data: [
        "Data Science & AI",

        [
            "Learn Python",
            "Learn statistics basics",
            "Learn NumPy and Pandas",
            "Learn data visualization",
            "Learn SQL",
            "Learn Machine Learning basics",
            "Practice with real datasets",
            "Learn basic Deep Learning concepts",
            "Build Data Science and AI projects",
            "Create a portfolio and apply for internships"
        ]
    ],


    /* 3. Cybersecurity */

    cyber: [
        "Cybersecurity",

        [
            "Learn computer fundamentals",
            "Learn networking basics",
            "Learn Linux",
            "Learn cybersecurity concepts",
            "Understand common web security risks",
            "Learn OWASP basics",
            "Practice in legal cybersecurity labs",
            "Build security-related projects",
            "Create a cybersecurity portfolio",
            "Apply for internships and entry-level jobs"
        ]
    ],


    /* 4. Government Jobs */

    govt: [
        "Government Jobs",

        [
            "Choose the government exam",
            "Read the complete syllabus",
            "Understand the exam pattern",
            "Create a daily timetable",
            "Read current affairs regularly",
            "Practice quantitative aptitude",
            "Practice reasoning and verbal ability",
            "Solve previous year papers",
            "Take mock tests",
            "Review mistakes and improve weak areas"
        ]
    ],


    /* 5. Python Development */

    python: [
        "Python Development",

        [
            "Learn Python basics",
            "Learn variables, loops and functions",
            "Learn lists, dictionaries and sets",
            "Learn Object-Oriented Programming",
            "Learn file handling and error handling",
            "Learn Python libraries",
            "Learn SQL and databases",
            "Learn Flask or Django",
            "Build 2-3 Python projects",
            "Create a portfolio and apply for internships"
        ]
    ],


    /* 6. Java Development */

    java: [
        "Java Development",

        [
            "Learn Java syntax and basics",
            "Learn variables, loops and conditions",
            "Learn Object-Oriented Programming",
            "Learn arrays and collections",
            "Learn exception handling",
            "Practice Java coding problems",
            "Learn SQL and databases",
            "Learn Spring Boot basics",
            "Build Java projects",
            "Create a portfolio and apply for jobs"
        ]
    ],


    /* 7. App Development */

    app: [
        "App Development",

        [
            "Learn programming fundamentals",
            "Choose Android, Flutter or another platform",
            "Learn UI design basics",
            "Learn app navigation",
            "Learn APIs and JSON",
            "Learn databases",
            "Build a simple app",
            "Build 2-3 useful mobile apps",
            "Test and publish your app",
            "Create a portfolio and apply for internships"
        ]
    ],


    /* 8. Cloud Computing */

    cloud: [
        "Cloud Computing",

        [
            "Learn computer and networking basics",
            "Learn Linux fundamentals",
            "Learn cloud computing concepts",
            "Learn AWS, Azure or Google Cloud basics",
            "Learn virtual machines and storage",
            "Learn databases and networking in cloud",
            "Learn Docker basics",
            "Learn CI/CD basics",
            "Build and deploy cloud projects",
            "Prepare for cloud internships and certifications"
        ]
    ],


    /* 9. Software Testing */

    testing: [
        "Software Testing",

        [
            "Learn software development basics",
            "Learn software testing concepts",
            "Learn manual testing",
            "Learn test cases and bug reporting",
            "Learn SDLC and STLC",
            "Learn API testing basics",
            "Learn SQL basics",
            "Learn automation testing tools",
            "Build testing practice projects",
            "Apply for testing internships and jobs"
        ]
    ],


    /* 10. UI/UX Design */

    uiux: [
        "UI/UX Design",

        [
            "Learn UI and UX fundamentals",
            "Learn design principles",
            "Learn color and typography basics",
            "Learn user research basics",
            "Learn wireframing",
            "Learn Figma",
            "Create mobile and web designs",
            "Build a design portfolio",
            "Create case studies",
            "Apply for UI/UX internships and jobs"
        ]
    ]

};


/* ---------- Show Career Roadmap ---------- */

$("showCareer").onclick = () => {

    const selected = $("field").value;

    const career = CAREERS[selected];


    if (!career) {

        $("careerOut").innerHTML =
            "<p class='warn'>Please select a career.</p>";

        return;
    }


    const [name, steps] = career;


    $("careerOut").innerHTML =

        "<h3>" +
        esc(name) +
        "</h3>" +

        "<ol>" +

        steps
            .map(
                step =>
                    "<li>" +
                    esc(step) +
                    "</li>"
            )
            .join("") +

        "</ol>";

};