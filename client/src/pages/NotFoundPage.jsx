import { Link } from "react-router-dom"

export default function NotFound() {
    return (
        <>
            <h1 style={{ fontSize: "80px" }}>404</h1>
            <h2>Page not found.</h2>
            <h4>Well... this is awkward. The page you are looking for is not here.</h4>
            <br></br>
            <h4>Navigate <Link to='/' style={{ textDecoration: "None"}}>Home</Link> here.</h4>
        </>
    );
}