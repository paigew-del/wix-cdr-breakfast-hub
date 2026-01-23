import Analytics from './pages/Analytics';
import FeedbackForm from './pages/FeedbackForm';
import MenuCalendar from './pages/MenuCalendar';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "FeedbackForm": FeedbackForm,
    "MenuCalendar": MenuCalendar,
}

export const pagesConfig = {
    mainPage: "MenuCalendar",
    Pages: PAGES,
    Layout: __Layout,
};