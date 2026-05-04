import React, { useMemo, useState } from 'react';
import { useApprovedPosts, useTeams } from '../../lib/queries';
import PostCard from '../news/PostCard';
import CategoryChips, { type CategoryFilter } from '../news/CategoryChips';

const News: React.FC = () => {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [teamId, setTeamId] = useState<string>('');

  const teamsQ = useTeams();
  const postsQ = useApprovedPosts(category, teamId || undefined);
  const teams = teamsQ.data ?? [];
  const posts = useMemo(() => postsQ.data ?? [], [postsQ.data]);

  return (
    <section id="news" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <h2 className="text-2xl md:text-3xl font-black border-r-4 pr-4 mb-6" style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}>
        חדשות וכתבות
      </h2>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <CategoryChips active={category} onChange={setCategory} />
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-full text-sm px-3 py-1.5"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#F2EDE6', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="">כל הקבוצות</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {postsQ.isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      )}
      {postsQ.error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>לא ניתן לטעון חדשות כעת.</div>
      )}
      {posts.length === 0 && !postsQ.isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>אין פרסומים עדיין</div>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </section>
  );
};

export default News;
