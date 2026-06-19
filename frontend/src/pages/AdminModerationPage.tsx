import React, { useState, useEffect, useCallback } from "react";
import { moderationService } from "../features/moderation/moderation.service";
import { Post, Comment } from "../types";
import { Shield, EyeOff, Eye, Loader2, MessageSquare, FileText } from "lucide-react";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

export const AdminModerationPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Moderation action states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<{ id: string; type: "post" | "comment"; currentStatus: "ACTIVE" | "HIDDEN" } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "posts") {
        const data = await moderationService.getModeratedPosts();
        setPosts(data);
      } else {
        const data = await moderationService.getModeratedComments();
        setComments(data);
      }
    } catch {
      setError("Não foi possível carregar os itens para moderação.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        loadData();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleActionClick = (id: string, type: "post" | "comment", currentStatus: "ACTIVE" | "HIDDEN") => {
    setTargetItem({ id, type, currentStatus });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!targetItem) return;
    setConfirmOpen(false);
    setIsProcessing(true);

    const { id, type, currentStatus } = targetItem;
    const nextStatus = currentStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";

    try {
      if (type === "post") {
        await moderationService.moderatePost(id, nextStatus);
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
      } else {
        await moderationService.moderateComment(id, nextStatus);
        setComments(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
      }
    } catch {
      alert("Erro ao executar ação de moderação.");
    } finally {
      setIsProcessing(false);
      setTargetItem(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center space-x-3 transition-colors duration-300">
        <div className="bg-rose-50 dark:bg-rose-950/45 p-3 rounded-full text-rose-600 dark:text-rose-400">
          <Shield size={32} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Painel de Moderação</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administre publicações e comentários sinalizados ou inapropriados para manter o ambiente corporativo saudável.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors cursor-pointer ${
            activeTab === "posts"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <FileText size={16} />
          <span>Publicações ({posts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors cursor-pointer ${
            activeTab === "comments"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <MessageSquare size={16} />
          <span>Comentários ({comments.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {isLoading && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center space-y-2 text-slate-500 dark:text-slate-400 transition-colors">
            <Loader2 className="animate-spin text-rose-600 dark:text-rose-450" size={24} />
            <span className="text-sm font-semibold">Buscando denúncias e fila de triagem...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-red-500 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Posts Moderation List */}
        {!isLoading && !error && activeTab === "posts" && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500 italic">
                Nenhum post na fila de moderação.
              </div>
            ) : (
              posts.map((post) => (
                <div 
                  key={post.id} 
                  className={`bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    post.status === "HIDDEN" ? "border-dashed border-rose-300 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/15" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{post.author.fullName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{post.author.department}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(post.createdAt).toLocaleString("pt-BR")}
                      </span>
                      {post.status === "HIDDEN" && (
                        <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          OCULTO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl line-clamp-3">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleActionClick(post.id, "post", post.status === "HIDDEN" ? "HIDDEN" : "ACTIVE")}
                      disabled={isProcessing}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer border ${
                        post.status === "HIDDEN"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                          : "bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                      }`}
                    >
                      {post.status === "HIDDEN" ? (
                        <>
                          <Eye size={14} />
                          <span>Restaurar</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} />
                          <span>Ocultar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Comments Moderation List */}
        {!isLoading && !error && activeTab === "comments" && (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500 italic">
                Nenhum comentário na fila de moderação.
              </div>
            ) : (
              comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    comment.status === "HIDDEN" ? "border-dashed border-rose-300 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/15" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{comment.author.fullName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Post ID: {comment.postId}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(comment.createdAt).toLocaleString("pt-BR")}
                      </span>
                      {comment.status === "HIDDEN" && (
                        <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          OCULTO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl line-clamp-3">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleActionClick(comment.id, "comment", comment.status === "HIDDEN" ? "HIDDEN" : "ACTIVE")}
                      disabled={isProcessing}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer border ${
                        comment.status === "HIDDEN"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/50"
                          : "bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/50"
                      }`}
                    >
                      {comment.status === "HIDDEN" ? (
                        <>
                          <Eye size={14} />
                          <span>Restaurar</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} />
                          <span>Ocultar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={targetItem ? (targetItem.currentStatus === "ACTIVE" ? "Ocultar conteúdo?" : "Restaurar conteúdo?") : ""}
        description={
          targetItem
            ? targetItem.currentStatus === "ACTIVE"
              ? `Tem certeza de que deseja ocultar este ${targetItem.type === "post" ? "post" : "comentário"}? Ele não será mais visível no feed principal dos colaboradores.`
              : `Deseja restaurar a visibilidade deste ${targetItem.type === "post" ? "post" : "comentário"} no feed principal?`
            : ""
        }
        confirmText={targetItem ? (targetItem.currentStatus === "ACTIVE" ? "Ocultar" : "Restaurar") : ""}
        cancelText="Cancelar"
        isDestructive={targetItem ? targetItem.currentStatus === "ACTIVE" : false}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetItem(null);
        }}
      />
    </div>
  );
};
