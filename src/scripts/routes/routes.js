import HomePage from '../pages/home/home-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/stories/add-story-page';
import SavedStoriesPage from '../pages/stories/saved-stories-page';
import NotFoundPage from '../pages/not-found-page'; // Tambahkan impor ini

const routes = {
  '/': new HomePage(),
  '/stories': new AddStoryPage(),
  '/story/:id': new StoryDetailPage(),
  '/saved-stories': new SavedStoriesPage(),
  '/login': LoginPage,
  '/register': RegisterPage,
  '404': NotFoundPage, // Tambahkan rute ini untuk halaman tidak ditemukan
};

export default routes;