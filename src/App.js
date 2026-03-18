import { useActionState, useEffect, useState } from "react";
import "./style.css";
import supabase from "./supabase.js";

const CATEGORIES = [
    { name: "technology", color: "#3b82f6" },
    { name: "science", color: "#16a34a" },
    { name: "finance", color: "#ef4444" },
    { name: "society", color: "#eab308" },
    { name: "entertainment", color: "#db2777" },
    { name: "health", color: "#14b8a6" },
    { name: "history", color: "#f97316" },
    { name: "news", color: "#8b5cf6" },
];

const initialFacts = [
    {
        id: 1,
        text: "React is being developed by Meta (formerly facebook)",
        source: "https://opensource.fb.com/",
        category: "technology",
        votesInteresting: 24,
        votesMindblowing: 9,
        votesFalse: 4,
        createdIn: 2021,
    },
    {
        id: 2,
        text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
        source: "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
        category: "society",
        votesInteresting: 11,
        votesMindblowing: 2,
        votesFalse: 0,
        createdIn: 2019,
    },
    {
        id: 3,
        text: "Lisbon is the capital of Portugal",
        source: "https://en.wikipedia.org/wiki/Lisbon",
        category: "society",
        votesInteresting: 8,
        votesMindblowing: 3,
        votesFalse: 1,
        createdIn: 2015,
    },
];

function App() {
    const [showForm, setShowForm] = useState(false);
    const [facts, setFacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentCategory, setCurrentCategory] = useState("all");

    useEffect(
        function () {
            async function getFacts() {
                setIsLoading(true);

                let query = supabase.from("facts").select("*");

                if (currentCategory !== "all")
                    query = query.eq("category", currentCategory);

                const { data: facts, error } = await query
                    .order("voteslikes", { ascending: false })
                    .limit(1000);

                if (!error) {
                    setFacts(facts);
                } else
                    alert(
                        "There is an error loading the data, please try refreshing your browers",
                    );
                setIsLoading(false);
            }
            getFacts();
        },
        [currentCategory],
    );

    return (
        <>
            <Header showForm={showForm} setShowForm={setShowForm} />
            {showForm ? (
                <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
            ) : null}

            <main className="main">
                <CategoryFilter setCurrentCategory={setCurrentCategory} />
                {isLoading ? (
                    <Loader />
                ) : (
                    <FactList setFacts={setFacts} facts={facts} />
                )}
            </main>
        </>
    );
}

function Loader() {
    return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
    const appTitle = "Today I Learned";

    return (
        <header className="header">
            <div className="logo">
                <img
                    src="logo.png"
                    height="68"
                    width="68"
                    alt="The today I learned logo"
                />
                <h1>{appTitle}</h1>
            </div>
            <button
                className="btn btn-large btn-open"
                onClick={() => setShowForm((show) => !show)}
            >
                {showForm ? "Close" : "Share a fact"}
            </button>
        </header>
    );
}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
    const cats = CATEGORIES;
    const [text, setText] = useState("");
    const [source, setSource] = useState("");
    const [category, setCategory] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const textLength = text.length;

    async function HandleSubmit(e) {
        // 1. Prevent browser reload
        e.preventDefault();
        console.log(text, source, category);

        // 2. Check if data is valid. If so create new fact
        if (text && isValidHttpUrl(source) && category && textLength <= 200) {
            // 3. Create a new fact object
            // const newFact = {
            //     id: Math.round(Math.random() * 10000),
            //     text: text,
            //     source: source,
            //     category: category,
            //     votesInteresting: 0,
            //     votesMindblowing: 0,
            //     votesFalse: 0,
            //     createdIn: new Date().getFullYear(),
            // };

            //3.Upload fact to Supabase and recieve the new fact
            setIsUploading(true);
            const { data: newFact, error } = await supabase
                .from("facts")
                .insert([{ text, source, category }])
                .select();
            setIsUploading(false);

            // 4. Add the new fact to the UI: add the fact to state
            if (!error) setFacts((facts) => [newFact[0], ...facts]);
            console.log(newFact);

            // 5. Reset input fields
            setText(" ");
            setSource(" ");
            setCategory(" ");

            // 6. Close the form
            setShowForm(false);
        }
    }

    return (
        <form className="fact-form" onSubmit={HandleSubmit}>
            <input
                type="text"
                placeholder="Share a fact with the world..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isUploading}
            />

            <span>{200 - textLength}</span>
            <input
                type="text"
                placeholder="Trusted source..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={isUploading}
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
            >
                <option value="">Choose category:</option>
                {cats.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                        {cat.name.toUpperCase()}
                    </option>
                ))}
            </select>
            <button className="btn btn-large" disabled={isUploading}>
                Post
            </button>
        </form>
    );
}

function CategoryFilter({ setCurrentCategory }) {
    const cats = CATEGORIES;
    return (
        <aside>
            <ul>
                <li className="category">
                    <button
                        className="btn btn-all-categories"
                        onClick={() => setCurrentCategory("all")}
                    >
                        All
                    </button>
                </li>

                {cats.map((cat) => (
                    <li key={cat.name} className="category">
                        <button
                            className="btn btn-category"
                            style={{ backgroundColor: cat.color }}
                            onClick={() => setCurrentCategory(cat.name)}
                        >
                            {cat.name}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

function FactList({ facts, setFacts }) {
    if (facts.length === 0) {
        return (
            <div>
                <p className="message">
                    There are no facts for this category yet!
                </p>
                <p className="message">Why not create the first one.</p>
            </div>
        );
    }

    return (
        <section>
            <ul className="facts-list">
                {facts.map((fact) => (
                    <Fact key={fact.id} fact={fact} setFacts={setFacts} />
                ))}
            </ul>
            <p>There are {facts.length} facts in the database, add your own!</p>
        </section>
    );
}

function Fact({ fact, setFacts }) {
    const [isUpDating, setUpDating] = useState(false);
    const cats = CATEGORIES;
    const isDisputed =
        fact.voteslikes + fact.votesmindblowing < fact.votesfalse;

    async function HandleVote(voteType) {
        setUpDating(true);
        const { data: updatedFact, error } = await supabase
            .from("facts")
            .update({ [voteType]: fact[voteType] + 1 })
            .eq("id", fact.id)
            .select();
        setUpDating(false);

        if (!error)
            setFacts((facts) =>
                facts.map((f) => (f.id === fact.id ? updatedFact[0] : f)),
            );
    }

    return (
        <li className="fact">
            <p>
                {isDisputed ? (
                    <span className="disputed">⛔️ DISPUTED ⛔️</span>
                ) : null}
                {fact.text}
                <a className="source" href={fact.source} target="_blank">
                    (Source)
                </a>
            </p>
            <span
                className="tag"
                style={{
                    backgroundColor: CATEGORIES.find(
                        (cat) => cat.name === fact.category,
                    )?.color,
                }}
            >
                {fact.category}
            </span>
            <div className="vote-buttons">
                <button
                    onClick={() => HandleVote("voteslikes")}
                    disabled={isUpDating}
                >
                    👍 {fact.voteslikes}
                </button>
                <button
                    onClick={() => HandleVote("votesmindblowing")}
                    disabled={isUpDating}
                >
                    🤯 {fact.votesmindblowing}
                </button>
                <button
                    onClick={() => HandleVote("votesfalse")}
                    disabled={isUpDating}
                >
                    ⛔️ {fact.votesfalse}
                </button>
            </div>
        </li>
    );
}

export default App;
