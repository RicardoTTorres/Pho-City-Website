import { useContent } from "@/context/ContentContext";
import aboutUs from "@/assets/aboutUs.png";

export default function About() {
    const { content } = useContent();
    
    return (
        
        /*Formats Text and Image*/
        <div
            style={{
                display: "flex",
                alignItems: "center",      
                justifyContent: "space-between",
                padding: "50px",           
      }}>

        <div style={{ maxWidth: "45%"}}>
            
            {/*Header With Space at the bottom*/}
            <h1 style={{ marginBottom: "50px"}}>Pho City: Where Vietnamese Cuisine Transends Expectations!</h1>

            {/*About Us content from ContentContext.tsx*/}
            <p>
                {content.about.content}
            </p>
            </div>
            
            {/*Image*/}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <img src = {aboutUs} 
            alt = "About Us"
            style={{ width: "650px", height: "auto"}} />
            </div>
        </div>
    );
}