import React, {useEffect} from "react";
import {Outlet,useNavigate} from "react-router-dom";

const Index = () => {
    useEffect(() => {

    }, []);

    return (
        <>
            <div className="app-layout">
                <Outlet/>
            </div>
        </>
    );
};

export default Index;
