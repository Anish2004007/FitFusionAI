import {
    useEffect,
    useRef,
    useState
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getDashboard } from "../services/api";


function AICoach({ onUserLoaded }) {

    // =====================================================
    // CHAT STATE
    // =====================================================

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "ai",
            text:
                "Hi! I'm your **FitFusion AI Coach**. " +
                "Ask me anything about your workouts, nutrition, " +
                "hydration, progress, or fitness goals."
        }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);


    // =====================================================
    // FITNESS SCORE
    // =====================================================

    const [scoreData, setScoreData] = useState(null);
    const [scoreLoading, setScoreLoading] = useState(true);


    // =====================================================
    // DAILY PLAN
    // =====================================================

    const [dailyPlan, setDailyPlan] = useState("");
    const [dailyPlanLoading, setDailyPlanLoading] =
        useState(true);
    const [dailyPlanError, setDailyPlanError] =
        useState("");


    // =====================================================
    // CHAT SCROLL
    // =====================================================

    const messagesEndRef = useRef(null);


    // =====================================================
    // LOAD USER
    // =====================================================

    useEffect(() => {

        const loadUser = async () => {

            try {

                const result =
                    await getDashboard();

                if (
                    result &&
                    result.success &&
                    result.user &&
                    onUserLoaded
                ) {

                    onUserLoaded(
                        result.user
                    );

                }

            } catch (error) {

                console.error(
                    "Unable to load AI Coach user:",
                    error
                );

            }

        };

        loadUser();

    }, [onUserLoaded]);


    // =====================================================
    // FITNESS SCORE
    // =====================================================

    useEffect(() => {

        let cancelled = false;

        const loadFitnessScore =
            async () => {

                try {

                    setScoreLoading(true);

                    const response =
                        await fetch(
                            "http://localhost:8000/ai-coach/api/fitness-score/",
                            {
                                method: "GET",
                                credentials: "include",
                                headers: {
                                    Accept:
                                        "application/json"
                                }
                            }
                        );

                    const data =
                        await response.json();

                    if (
                        !cancelled &&
                        response.ok &&
                        data.success &&
                        data.fitness_score
                    ) {

                        setScoreData(
                            data.fitness_score
                        );

                    }

                } catch (error) {

                    if (!cancelled) {

                        console.error(
                            "Unable to load fitness score:",
                            error
                        );

                    }

                } finally {

                    if (!cancelled) {
                        setScoreLoading(false);
                    }

                }

            };

        loadFitnessScore();

        return () => {
            cancelled = true;
        };

    }, []);


    // =====================================================
    // DAILY PLAN
    // =====================================================

    useEffect(() => {

        let cancelled = false;

        const loadDailyPlan =
            async () => {

                setDailyPlanLoading(true);
                setDailyPlanError("");
                setDailyPlan("");

                const controller =
                    new AbortController();

                const timeoutId =
                    setTimeout(() => {

                        controller.abort();

                    }, 35000);


                try {

                    const response =
                        await fetch(
                            "http://localhost:8000/ai-coach/api/daily-plan/",
                            {
                                method: "GET",
                                credentials: "include",
                                headers: {
                                    Accept:
                                        "application/json"
                                },
                                signal:
                                    controller.signal
                            }
                        );


                    let data;

                    try {

                        data =
                            await response.json();

                    } catch (error) {

                        throw new Error(
                            "Invalid response from AI Coach server."
                        );

                    }


                    if (
                        !cancelled &&
                        response.ok &&
                        data &&
                        data.success &&
                        data.plan
                    ) {

                        setDailyPlan(
                            data.plan
                        );

                        setDailyPlanError("");

                        return;

                    }


                    throw new Error(
                        data?.error ||
                        "Unable to generate today's AI plan."
                    );


                } catch (error) {

                    if (cancelled) {
                        return;
                    }


                    console.error(
                        "Daily plan error:",
                        error
                    );


                    if (
                        error?.name ===
                        "AbortError"
                    ) {

                        setDailyPlanError(
                            "AI Coach took too long to respond. Please try again."
                        );

                    } else {

                        setDailyPlanError(
                            error?.message ||
                            "Unable to generate today's AI plan."
                        );

                    }

                } finally {

                    clearTimeout(
                        timeoutId
                    );

                    if (!cancelled) {

                        setDailyPlanLoading(
                            false
                        );

                    }

                }

            };


        loadDailyPlan();


        return () => {

            cancelled = true;

        };

    }, []);


    // =====================================================
    // AUTO SCROLL
    // =====================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const sendMessage = async (
        messageText = input
    ) => {

        const message =
            messageText.trim();


        if (
            !message ||
            loading
        ) {

            return;

        }


        // -------------------------------------------------
        // USER MESSAGE
        // -------------------------------------------------

        const userMessage = {

            id: Date.now(),

            sender: "user",

            text: message

        };


        setMessages(
            previous => [
                ...previous,
                userMessage
            ]
        );


        setInput("");
        setLoading(true);


        // -------------------------------------------------
        // TIMEOUT
        // -------------------------------------------------

        const controller =
            new AbortController();


        const timeoutId =
            setTimeout(() => {

                controller.abort();

            }, 35000);


        try {

            console.log(
                "Sending FitFusion AI message:",
                message
            );


            const response =
                await fetch(
                    "http://localhost:8000/ai-coach/api/",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json"
                        },

                        credentials:
                            "include",

                        signal:
                            controller.signal,

                        body:
                            JSON.stringify({
                                message:
                                    message
                            })
                    }
                );


            let data;


            try {

                data =
                    await response.json();

            } catch (error) {

                throw new Error(
                    "Invalid response from AI Coach server."
                );

            }


            console.log(
                "FitFusion AI response:",
                data
            );


            // =================================================
            // SUCCESS
            //
            // This includes both:
            //
            // fallback: false
            //      = Gemini response
            //
            // fallback: true
            //      = local backend response
            // =================================================

            if (
                response.ok &&
                data.success &&
                data.message
            ) {

                const aiMessage = {

                    id:
                        Date.now() + 1,

                    sender:
                        "ai",

                    text:
                        data.message

                };


                setMessages(
                    previous => [
                        ...previous,
                        aiMessage
                    ]
                );


                return;

            }


            // =================================================
            // AUTHENTICATION
            // =================================================

            if (
                response.status === 401
            ) {

                throw new Error(
                    "Your session has expired. Please log in again."
                );

            }


            // =================================================
            // OTHER ERROR
            // =================================================

            throw new Error(
                data?.error ||
                "Unable to get AI response."
            );


        } catch (error) {

            console.error(
                "AI Coach Error:",
                error
            );


            let errorText;


            // -------------------------------------------------
            // TIMEOUT
            // -------------------------------------------------

            if (
                error?.name ===
                "AbortError"
            ) {

                errorText =
                    "⏱️ **FitFusion AI is taking too long to respond.**\n\n" +
                    "Please try again in a moment.";

            }


            // -------------------------------------------------
            // NETWORK ERROR
            // -------------------------------------------------

            else if (
                error?.message &&
                (
                    error.message.includes(
                        "Failed to fetch"
                    ) ||
                    error.message.includes(
                        "NetworkError"
                    )
                )
            ) {

                errorText =
                    "🌐 **Unable to connect to FitFusion AI.**\n\n" +
                    "Please make sure the Django server is running " +
                    "and try again.";

            }


            // -------------------------------------------------
            // LOGIN ERROR
            // -------------------------------------------------

            else if (
                error?.message &&
                error.message.includes(
                    "session has expired"
                )
            ) {

                errorText =
                    "🔐 **Your session has expired.**\n\n" +
                    "Please log in again to use FitFusion AI.";

            }


            // -------------------------------------------------
            // GENERAL ERROR
            // -------------------------------------------------

            else {

                errorText =
                    "⚠️ **FitFusion AI is temporarily unavailable.**\n\n" +
                    "Please try again in a moment.";

            }


            const errorMessage = {

                id:
                    Date.now() + 1,

                sender:
                    "ai",

                text:
                    errorText

            };


            setMessages(
                previous => [
                    ...previous,
                    errorMessage
                ]
            );


        } finally {

            clearTimeout(
                timeoutId
            );

            setLoading(false);

        }

    };


    // =====================================================
    // ENTER KEY
    // =====================================================

    const handleKeyDown = (
        event
    ) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    };


    // =====================================================
    // QUICK QUESTIONS
    // =====================================================

    const quickQuestions = [

        "What should I focus on today?",

        "Suggest a workout for me",

        "What should I eat today?",

        "How is my progress?"

    ];


    // =====================================================
    // MARKDOWN COMPONENTS
    // =====================================================

    const markdownComponents = {

        h1: ({ children }) => (

            <h3 className="ai-markdown-heading">
                {children}
            </h3>

        ),

        h2: ({ children }) => (

            <h3 className="ai-markdown-heading">
                {children}
            </h3>

        ),

        h3: ({ children }) => (

            <h4 className="ai-markdown-heading">
                {children}
            </h4>

        ),

        p: ({ children }) => (

            <p className="ai-markdown-paragraph">
                {children}
            </p>

        ),

        strong: ({ children }) => (

            <strong className="ai-markdown-bold">
                {children}
            </strong>

        ),

        ul: ({ children }) => (

            <ul className="ai-markdown-list">
                {children}
            </ul>

        ),

        ol: ({ children }) => (

            <ol className="ai-markdown-list">
                {children}
            </ol>

        ),

        li: ({ children }) => (

            <li>
                {children}
            </li>

        ),

        blockquote: ({ children }) => (

            <blockquote className="ai-markdown-quote">
                {children}
            </blockquote>

        ),

        code: ({ children }) => (

            <code className="ai-markdown-code">
                {children}
            </code>

        ),

        hr: () => null

    };


    // =====================================================
    // SCORE CLASS
    // =====================================================

    const getScoreClass = (
        score
    ) => {

        if (score >= 90) {
            return "score-excellent";
        }

        if (score >= 75) {
            return "score-very-good";
        }

        if (score >= 60) {
            return "score-good";
        }

        if (score >= 40) {
            return "score-needs-work";
        }

        return "score-starting";

    };


    // =====================================================
    // FITNESS SCORE
    // =====================================================

    const renderFitnessScore = () => {

        if (scoreLoading) {

            return (

                <div className="ai-score-card">

                    <div className="ai-score-header">

                        <div>

                            <span className="ai-score-label">
                                AI FITNESS SCORE
                            </span>

                            <h2>
                                Your Fitness Score
                            </h2>

                        </div>

                    </div>


                    <div className="ai-score-loading">

                        <div className="ai-score-spinner"></div>

                        <span>
                            Analyzing your fitness data...
                        </span>

                    </div>

                </div>

            );

        }


        if (!scoreData) {

            return null;

        }


        const score =
            Number(
                scoreData.score
            ) || 0;


        const scoreClass =
            getScoreClass(
                score
            );


        const breakdown =
            scoreData.breakdown ||
            {};


        return (

            <div
                className={
                    `ai-score-card ${scoreClass}`
                }
            >

                <div className="ai-score-header">

                    <div>

                        <span className="ai-score-label">
                            AI FITNESS SCORE
                        </span>

                        <h2>
                            Your Fitness Score
                        </h2>

                    </div>


                    <div className="ai-score-badge">
                        AI
                    </div>

                </div>


                <div className="ai-score-main">

                    <div className="ai-score-circle">

                        <div>

                            <strong>
                                {score}
                            </strong>

                            <span>
                                /100
                            </span>

                        </div>

                    </div>


                    <div className="ai-score-summary">

                        <span className="ai-score-rating">
                            {scoreData.rating}
                        </span>

                        <p>
                            Based on your current
                            workouts, hydration,
                            nutrition, activity and
                            goal progress.
                        </p>

                    </div>

                </div>


                <div className="ai-score-breakdown">

                    <div className="ai-score-item">

                        <div className="ai-score-item-top">

                            <span>
                                💪 Workout
                            </span>

                            <strong>
                                {
                                    breakdown.workout ??
                                    0
                                }
                                /30
                            </strong>

                        </div>


                        <div className="ai-score-progress">

                            <span
                                style={{
                                    width:
                                        `${Math.min(
                                            (
                                                (
                                                    breakdown.workout ||
                                                    0
                                                ) / 30
                                            ) * 100,
                                            100
                                        )}%`
                                }}
                            ></span>

                        </div>

                    </div>


                    <div className="ai-score-item">

                        <div className="ai-score-item-top">

                            <span>
                                💧 Hydration
                            </span>

                            <strong>
                                {
                                    breakdown.hydration ??
                                    0
                                }
                                /20
                            </strong>

                        </div>


                        <div className="ai-score-progress">

                            <span
                                style={{
                                    width:
                                        `${Math.min(
                                            (
                                                (
                                                    breakdown.hydration ||
                                                    0
                                                ) / 20
                                            ) * 100,
                                            100
                                        )}%`
                                }}
                            ></span>

                        </div>

                    </div>


                    <div className="ai-score-item">

                        <div className="ai-score-item-top">

                            <span>
                                🍽️ Nutrition
                            </span>

                            <strong>
                                {
                                    breakdown.nutrition ??
                                    0
                                }
                                /20
                            </strong>

                        </div>


                        <div className="ai-score-progress">

                            <span
                                style={{
                                    width:
                                        `${Math.min(
                                            (
                                                (
                                                    breakdown.nutrition ||
                                                    0
                                                ) / 20
                                            ) * 100,
                                            100
                                        )}%`
                                }}
                            ></span>

                        </div>

                    </div>


                    <div className="ai-score-item">

                        <div className="ai-score-item-top">

                            <span>
                                🎯 Goal Progress
                            </span>

                            <strong>
                                {
                                    breakdown.goal_progress ??
                                    0
                                }
                                /20
                            </strong>

                        </div>


                        <div className="ai-score-progress">

                            <span
                                style={{
                                    width:
                                        `${Math.min(
                                            (
                                                (
                                                    breakdown.goal_progress ||
                                                    0
                                                ) / 20
                                            ) * 100,
                                            100
                                        )}%`
                                }}
                            ></span>

                        </div>

                    </div>


                    <div className="ai-score-item">

                        <div className="ai-score-item-top">

                            <span>
                                📈 Activity
                            </span>

                            <strong>
                                {
                                    breakdown.activity ??
                                    0
                                }
                                /10
                            </strong>

                        </div>


                        <div className="ai-score-progress">

                            <span
                                style={{
                                    width:
                                        `${Math.min(
                                            (
                                                (
                                                    breakdown.activity ||
                                                    0
                                                ) / 10
                                            ) * 100,
                                            100
                                        )}%`
                                }}
                            ></span>

                        </div>

                    </div>

                </div>

            </div>

        );

    };


    // =====================================================
    // DAILY PLAN
    // =====================================================

    const renderDailyPlan = () => {

        return (

            <section className="ai-daily-plan">

                <div className="ai-daily-plan-header">

                    <div>

                        <span className="ai-section-label">
                            🎯 AI DAILY PLAN
                        </span>

                        <h2>
                            Today's Focus
                        </h2>

                        <p>
                            Your personalized plan based
                            on your current progress.
                        </p>

                    </div>


                    <div className="ai-plan-badge">
                        AI
                    </div>

                </div>


                <div className="ai-daily-plan-content">

                    {dailyPlanLoading && (

                        <div className="ai-plan-loading">

                            <span className="ai-loading-dot">
                                ✨
                            </span>

                            Your AI Coach is preparing
                            today's plan...

                        </div>

                    )}


                    {!dailyPlanLoading &&
                        dailyPlan && (

                            <div className="ai-plan-markdown">

                                <ReactMarkdown
                                    remarkPlugins={[
                                        remarkGfm
                                    ]}
                                    components={
                                        markdownComponents
                                    }
                                >
                                    {dailyPlan}
                                </ReactMarkdown>

                            </div>

                        )}


                    {!dailyPlanLoading &&
                        dailyPlanError &&
                        !dailyPlan && (

                            <div className="ai-plan-error">

                                <div>
                                    {dailyPlanError}
                                </div>


                                <button
                                    type="button"
                                    onClick={() => {
                                        window.location.reload();
                                    }}
                                    style={{
                                        marginTop:
                                            "12px",

                                        padding:
                                            "8px 16px",

                                        border:
                                            "none",

                                        borderRadius:
                                            "8px",

                                        cursor:
                                            "pointer",

                                        fontWeight:
                                            "600"
                                    }}
                                >
                                    Try Again
                                </button>

                            </div>

                        )}


                    {!dailyPlanLoading &&
                        !dailyPlanError &&
                        !dailyPlan && (

                            <div className="ai-plan-loading">

                                No daily plan is available
                                right now.

                            </div>

                        )}

                </div>

            </section>

        );

    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="ai-coach-page">


            {/* HEADER */}

            <div className="ai-coach-header">

                <div>

                    <div className="ai-coach-label">
                        🤖 AI FITNESS COACH
                    </div>

                    <h1>
                        AI Coach
                    </h1>

                    <p>
                        Your personalized fitness
                        intelligence.
                    </p>

                </div>

            </div>


            {/* FITNESS SCORE */}

            {renderFitnessScore()}


            {/* DAILY PLAN */}

            {renderDailyPlan()}


            {/* QUICK QUESTIONS */}

            <div className="ai-quick-section">

                <p className="ai-section-title">
                    Try asking your coach
                </p>


                <div className="ai-quick-buttons">

                    {quickQuestions.map(
                        (question) => (

                            <button
                                key={question}
                                type="button"
                                onClick={() =>
                                    sendMessage(
                                        question
                                    )
                                }
                                disabled={loading}
                                className="ai-quick-button"
                            >
                                {question}
                            </button>

                        )
                    )}

                </div>

            </div>


            {/* CHAT */}

            <div className="ai-chat-card">

                <div className="ai-chat-messages">

                    {messages.map(
                        (message) => (

                            <div
                                key={message.id}
                                className={
                                    `ai-message-row ${
                                        message.sender === "user"
                                            ? "user-message-row"
                                            : ""
                                    }`
                                }
                            >

                                {message.sender === "ai" && (

                                    <div className="ai-avatar">
                                        🤖
                                    </div>

                                )}


                                <div
                                    className={
                                        `ai-message ${
                                            message.sender === "user"
                                                ? "user-message"
                                                : "coach-message"
                                        }`
                                    }
                                >

                                    {message.sender === "ai" ? (

                                        <ReactMarkdown
                                            remarkPlugins={[
                                                remarkGfm
                                            ]}
                                            components={
                                                markdownComponents
                                            }
                                        >
                                            {
                                                message.text
                                            }
                                        </ReactMarkdown>

                                    ) : (

                                        message.text

                                    )}

                                </div>

                            </div>

                        )
                    )}


                    {/* LOADING */}

                    {loading && (

                        <div className="ai-message-row">

                            <div className="ai-avatar">
                                🤖
                            </div>


                            <div className="ai-message coach-message ai-loading">

                                <span></span>
                                <span></span>
                                <span></span>

                            </div>

                        </div>

                    )}


                    <div
                        ref={messagesEndRef}
                    />

                </div>


                {/* INPUT */}

                <div className="ai-chat-input-area">

                    <textarea
                        value={input}
                        onChange={(event) =>
                            setInput(
                                event.target.value
                            )
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                        placeholder="Ask your AI Coach..."
                        rows={1}
                        disabled={loading}
                    />


                    <button
                        type="button"
                        onClick={() =>
                            sendMessage()
                        }
                        disabled={
                            loading ||
                            !input.trim()
                        }
                        className="ai-send-button"
                    >
                        ➤
                    </button>

                </div>


                {/* DISCLAIMER */}

                <p className="ai-disclaimer">

                    FitFusion AI provides general fitness
                    guidance and does not replace professional
                    medical advice.

                </p>

            </div>

        </div>

    );

}


export default AICoach;