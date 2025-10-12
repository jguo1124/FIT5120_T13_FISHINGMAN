import { getKnowledgeList } from './knowledge_repo.js';

export async function fetchKnowledgeList(query) {
  const {
    category = null,
    sort = 'date_desc',
    page = 1,
    page_size = 10
  } = query;

 
  const validCategory = ['guide', 'tutorial', 'news'];
  const validSort = ['date_desc', 'date_asc'];

  if (category && !validCategory.includes(category))
    throw new Error('Invalid category');
  if (!validSort.includes(sort))
    throw new Error('Invalid sort option');

  const result = await getKnowledgeList({
    category,
    sort,
    page,
    pageSize: page_size
  });

  return result;
}
