import React, { useState } from "react";
"../style/home.css"
import Chat from "../src/components/chat/Chat";

function Home (){
    return(
        <div className="home">
            <Chat/>
        </div>
    )
}
export default Home;