import React, { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { CustomSectionItem } from "../../types";

interface SectionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CustomSectionItem, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  sectionType: "education" | "experience" | "certificate" | "project" | "recommendation" | "custom" | "";
  itemToEdit: CustomSectionItem | null;
  currentUserFullName?: string;
}

export const SectionItemModal: React.FC<SectionItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  sectionType,
  itemToEdit,
  currentUserFullName
}) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || "");
      setSubtitle(itemToEdit.subtitle || "");
      setStartDate(itemToEdit.startDate || "");
      setEndDate(itemToEdit.endDate || "");
      setDescription(itemToEdit.description || "");
      setLink(itemToEdit.link || "");
    } else {
      if (sectionType === "recommendation" && currentUserFullName) {
        setTitle(currentUserFullName);
      } else {
        setTitle("");
      }
      setSubtitle("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setLink("");
    }
  }, [itemToEdit, isOpen, sectionType, currentUserFullName]);

  if (!isOpen || !sectionType) return null;

  const getModalTitle = () => {
    const isEdit = !!itemToEdit;
    switch (sectionType) {
      case "experience":
        return isEdit ? "Editar Experiência Profissional" : "Adicionar Experiência Profissional";
      case "education":
        return isEdit ? "Editar Formação Acadêmica" : "Adicionar Formação Acadêmica";
      case "certificate":
        return isEdit ? "Editar Certificação / Licença" : "Adicionar Certificação / Licença";
      case "project":
        return isEdit ? "Editar Projeto" : "Adicionar Projeto";
      case "recommendation":
        return isEdit ? "Editar Recomendação" : "Adicionar Recomendação";
      default:
        return isEdit ? "Editar Seção" : "Adicionar à Seção";
    }
  };

  const getLabels = () => {
    switch (sectionType) {
      case "experience":
        return {
          title: "Cargo / Função",
          titlePlaceholder: "Ex: Analista de Custos Sênior",
          subtitle: "Empresa / Organização",
          subtitlePlaceholder: "Ex: Mendonça Galvão Contadores Associados",
          showDates: true,
          showLink: false,
          showDesc: true,
          descPlaceholder: "Descreva suas principais responsabilidades, projetos entregues e conquistas..."
        };
      case "education":
        return {
          title: "Curso / Formação",
          titlePlaceholder: "Ex: Bacharelado em Ciências Contábeis",
          subtitle: "Instituição de Ensino",
          subtitlePlaceholder: "Ex: USP - Universidade de São Paulo",
          showDates: true,
          showLink: false,
          showDesc: true,
          descPlaceholder: "Descreva atividades acadêmicas, matérias relevantes ou notas de destaque..."
        };
      case "certificate":
        return {
          title: "Nome do Certificado",
          titlePlaceholder: "Ex: CRC Ativo / MBA em Auditoria",
          subtitle: "Organização Emissora",
          subtitlePlaceholder: "Ex: Conselho Regional de Contabilidade",
          showDates: true,
          showLink: true,
          linkTitle: "URL da Credencial",
          linkPlaceholder: "Ex: https://credencial.com/123",
          showDesc: false
        };
      case "project":
        return {
          title: "Nome do Projeto",
          titlePlaceholder: "Ex: Implantação de ERP Fiscal",
          subtitle: "Cliente / Empresa Vinculada (Opcional)",
          subtitlePlaceholder: "Ex: Indústrias Metalúrgicas S/A",
          showDates: false,
          showLink: true,
          linkTitle: "URL do Projeto (Opcional)",
          linkPlaceholder: "Ex: https://github.com/...",
          showDesc: true,
          descPlaceholder: "Descreva o escopo do projeto, tecnologias ou metodologias e resultados..."
        };
      case "recommendation":
        return {
          title: "Nome do Autor da Recomendação",
          titlePlaceholder: "Ex: Roberto Santos",
          subtitle: "Cargo / Relação de Trabalho",
          subtitlePlaceholder: "Ex: Gerente Contábil (Roberto foi meu gestor)",
          showDates: false,
          showLink: false,
          showDesc: true,
          descPlaceholder: "Escreva o depoimento/avaliação recebida..."
        };
      default:
        return {
          title: "Título",
          titlePlaceholder: "",
          subtitle: "Subtítulo",
          subtitlePlaceholder: "",
          showDates: true,
          showLink: true,
          linkTitle: "Link",
          linkPlaceholder: "",
          showDesc: true,
          descPlaceholder: ""
        };
    }
  };

  const labels = getLabels();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      subtitle: subtitle.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      description: description.trim(),
      link: link.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{getModalTitle()}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              {labels.title} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={sectionType === "recommendation"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={labels.titlePlaceholder}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              {labels.subtitle}
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={labels.subtitlePlaceholder}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Dates */}
          {labels.showDates && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Ano de Início
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Ex: 2022"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Ano de Fim / Conclusão
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Ex: Presente ou 2026"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Link */}
          {labels.showLink && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                {labels.linkTitle}
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={labels.linkPlaceholder}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Description */}
          {labels.showDesc && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={labels.descPlaceholder}
                className="mt-1 block w-full min-h-[90px] px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          {itemToEdit && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(itemToEdit.id)}
              className="text-xs font-semibold text-red-500 hover:text-red-750 flex items-center space-x-1 hover:underline cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Excluir</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Save size={14} />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
