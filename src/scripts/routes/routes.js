import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import StoriesPage from '../pages/stories/stories-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';

const routes = {
  '/': new HomePage(),
  '/stories': new StoriesPage(),
  '/story/:id': new StoryDetailPage(),
  '/about': new AboutPage(),
  '/login': LoginPage,
  '/register': RegisterPage,
};

export default routes;
