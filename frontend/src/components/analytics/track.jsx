import {useEffect} from 'react'
import { withRouter, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
const Track = () => {
    let location = useLocation();
    useEffect(() => {
        ReactGA.set({page: location.pathname});
        ReactGA.pageview(location.pathname);
    }, [location]);
    return null;
};
export default withRouter(Track);
