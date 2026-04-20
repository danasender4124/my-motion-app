import React from 'react';
import { motion } from 'framer-motion';
import { NEWS } from '../../data/league';

const TAG_COLORS: Record<string, string> = {
  'תוצאה':   '#FF4D00',
  'חדשות':   '#3B82F6',
  'ראיון':   '#8B5CF6',
  'העברות':  '#10B981',
};

const News: React.FC = () => (
  <section id="news" className="py-12 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>חדשות וכתבות</h2>
      <a
        href="#"
        className="text-sm font-medium transition-colors"
        style={{ color: 'rgba(242,237,230,0.45)' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#FF4D00')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(242,237,230,0.45)')}
      >
        כל הכתבות ←
      </a>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {NEWS.map((article, i) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] }}
          whileHover={{ y: -4 }}
          className="rounded-2xl overflow-hidden cursor-pointer group"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Image */}
          <div className="relative overflow-hidden" style={{ height: '180px' }}>
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,8,12,0.7) 0%, transparent 50%)' }} />
            <span
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: TAG_COLORS[article.tag] ?? '#FF4D00', color: '#fff' }}
            >
              {article.tag}
            </span>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3
              className="text-sm font-bold leading-snug mb-2 line-clamp-2 transition-colors duration-150"
              style={{ color: '#F2EDE6' }}
            >
              {article.title}
            </h3>
            <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'rgba(242,237,230,0.45)' }}>
              {article.excerpt}
            </p>
            <span className="text-[11px]" style={{ color: 'rgba(242,237,230,0.3)' }}>
              {article.date}
            </span>
          </div>
        </motion.article>
      ))}
    </div>
  </section>
);

export default News;
