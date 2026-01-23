import MenuCalendar from './pages/MenuCalendar';
import FeedbackForm from './pages/FeedbackForm';
import Analytics from './pages/Analytics';
import __Layout from './Layout.jsx';


export const PAGES = {
    "MenuCalendar": MenuCalendar,
    "FeedbackForm": FeedbackForm,
    "Analytics": Analytics,
}

export const pagesConfig = {
    mainPage: "MenuCalendar",
    Pages: PAGES,
    Layout: __Layout,
};