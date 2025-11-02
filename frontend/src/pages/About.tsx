import { useContent } from "@/context/ContentContext";

export default function About() {
    const { content } = useContent();
    const about = content.about
    
    // this is very bare bones just to test the backend for the about page.
    // frontend for about page still needs to be coded
    return (
        <>
            <h1>{about.title}</h1>
            <p>{about.content}</p>
        </>
    );
}