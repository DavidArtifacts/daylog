import { getBoard } from '@/app/boards/lib/actions';
import { getCurrentSession } from '@/app/login/lib/actions';
import NavHeader from '@/components/NavHeader';
import NavMenu from '@/components/NavMenu';
import Page from '@/components/Page';
import PageBody from '@/components/PageBody';
import PageContainer from '@/components/PageContainer';
import PageFooter from '@/components/PageFooter';
import PageHeader from '@/components/PageHeader';
import { redirect } from 'next/navigation';
import { getNote } from '../lib/actions';
import NoteEditorClientWrapper from './partials/NoteEditorClientWrapper';

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string; noteId: string }>;
}) {
  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect('/login');
  }
  const board = await getBoard(parseInt((await params).id));
  const note = await getNote(parseInt((await params).noteId));
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Boards', href: '/boards' },
    { name: board?.title ?? 'Notes', href: `/boards/${note?.boardsId}/notes` },
    {
      name: note?.title ?? '',
      href: `/boards/${note?.boardsId}/notes/${note?.id}`,
    },
  ];

  return (
    <Page>
      <NavHeader></NavHeader>
      <NavMenu></NavMenu>
      <PageContainer>
        <PageHeader
          title={note?.title}
          imageUrl={note?.imageUrl}
          breadcrumbs={breadcrumbs}
        ></PageHeader>
        <PageBody>
          <div className="card overflow-hidden">
            <div className="card-body p-0 border-0 h-auto">
              {note && <NoteEditorClientWrapper note={note} />}
            </div>
          </div>
        </PageBody>
      </PageContainer>
      <PageFooter></PageFooter>
    </Page>
  );
}
