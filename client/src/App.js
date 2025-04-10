import Forum from './pages/Forum/Forum';
import NewTopic from './pages/Forum/NewTopic';
import TopicView from './pages/Forum/TopicView';

<Route path="/forum" element={<Forum />} />
<Route path="/forum/new-topic" element={<NewTopic />} />
<Route path="/forum/topic/:id" element={<TopicView />} /> 