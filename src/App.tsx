import React from 'react';
import { useAuth } from './lib/AuthContext';
import { AuthProvider } from './lib/AuthContext';
import { Toaster } from 'sonner';
import { Dashboard } from './components/Dashboard';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceForm } from './components/InvoiceForm';
import { Button } from './components/ui/button';
import { FileText, LayoutDashboard, Plus, LogOut, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { LandingPage } from './components/LandingPage';

const AppContent = () => {
  const { user, loading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'invoices' | 'create'>('dashboard');
  const [editingInvoice, setEditingInvoice] = React.useState<any>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onSignIn={signIn} />;
  }

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setActiveTab('create');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-card md:block">
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Invoicely</span>
          </div>

          <nav className="flex-1 space-y-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'invoices' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab('invoices')}
            >
              <FileText className="h-5 w-5" />
              Invoices
            </Button>
            <Button
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => {
                setEditingInvoice(null);
                setActiveTab('create');
              }}
            >
              <Plus className="h-5 w-5" />
              New Invoice
            </Button>
          </nav>

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Theme</span>
              <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-full w-full rounded-full" />
                ) : (
                  <span className="text-xs font-bold">{user.displayName?.[0]}</span>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="mx-auto max-w-6xl p-6 md:p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Dashboard onNewInvoice={() => setActiveTab('create')} onEditInvoice={handleEdit} />
              </motion.div>
            )}
            {activeTab === 'invoices' && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <InvoiceList onEdit={handleEdit} onCreateNew={() => setActiveTab('create')} />
              </motion.div>
            )}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <InvoiceForm 
                  onCancel={() => setActiveTab('invoices')} 
                  onSuccess={() => setActiveTab('invoices')}
                  initialData={editingInvoice}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
