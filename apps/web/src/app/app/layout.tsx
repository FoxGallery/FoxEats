import { CartFab } from '@/components/cart-fab';
import { BottomTabs } from '@/components/ui/bottom-tabs';
import { ChatWidget } from '@/components/chat-widget';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AppLayout({ children }: any) {
  return (
    <div className="bg-bg flex min-h-dvh flex-col">
      <div className="flex-1">{children}</div>
      <CartFab />
      <BottomTabs />
      <ChatWidget />
    </div>
  );
}
