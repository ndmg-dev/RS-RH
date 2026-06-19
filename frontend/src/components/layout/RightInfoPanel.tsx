import React from "react";
import { Info, HelpCircle, FileText, Calendar } from "lucide-react";

export const RightInfoPanel: React.FC = () => {
  return (
    <aside className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-5 transition-colors duration-300">
      {/* Block 1: Institutional info */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center space-x-1">
          <Info size={14} className="text-slate-400 dark:text-slate-500" />
          <span>Avisos Importantes</span>
        </h4>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Plantão de Dúvidas Fiscal</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Toda terça-feira às 14h, com foco no preenchimento de obrigações tributárias municipais.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <FileText size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Portal de Documentos</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Novos modelos de relatórios de balanços patrimoniais adicionados na pasta pública.
            </p>
          </div>
        </div>
      </div>

      {/* Block 2: Corporate Best Practices */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center space-x-1">
          <HelpCircle size={14} className="text-slate-400 dark:text-slate-500" />
          <span>Manual de Boas Práticas</span>
        </h4>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
          <li>Classifique os lançamentos fiscais com o CFOP exato.</li>
          <li>Sinalize incompatibilidades de notas antes de fechar balancetes.</li>
          <li>Mantenha o eSocial atualizado com admissões com 24h de antecedência.</li>
          <li>Dúvidas de clientes? Registre sempre a resposta no CRM oficial.</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 text-center">
        Mendonça Galvão Contadores Associados © 2026. Todos os direitos reservados.
      </div>
    </aside>
  );
};
