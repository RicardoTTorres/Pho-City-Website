import { useContent } from "@/context/ContentContext";
import aboutUs from "@/assets/aboutUs.png";

export default function About() {
    const { content } = useContent();
    
    return (
        <>
            <h1>About Page</h1>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <img src = {aboutUs} 
            alt = "About Us"
            style={{ width: "650px", height: "auto", marginRight: "50px" }} />
            </div>
        </>
    );
}