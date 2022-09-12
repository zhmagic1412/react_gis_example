import React, {useEffect, useState} from "react"
import store from "@/store";
import {observer} from "mobx-react-lite";


const Home = () => {
    const [text, setText] = useState('');


    useEffect(
        () => {
        }, []
    )

    return <>
        <div>this is home</div>
        <div>this is mock data: {text}</div>
        <div>
            <button onClick={() => store.add()}>mobx test</button>
            {store.num}
        </div>

    </>

}
export default observer(Home)