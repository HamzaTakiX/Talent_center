import { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Link, List, ListOrdered } from 'lucide-react';

interface AdminRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const AdminRichTextEditor: FunctionComponent<AdminRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  minHeight = '200px',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = useCallback(
    (cmd: string, val?: string) => {
      document.execCommand(cmd, false, val);
      if (ref.current) onChange(ref.current.innerHTML);
    },
    [onChange],
  );

  return (
    <motion.div className="admin-rich-editor rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] overflow-hidden shadow-sm">
      <motion.div className="flex flex-wrap gap-1 border-b border-[var(--admin-border)] px-2 py-1.5 bg-[var(--admin-surface-elevated)]">
        {[
          { icon: Bold, cmd: 'bold' },
          { icon: Italic, cmd: 'italic' },
          { icon: List, cmd: 'insertUnorderedList' },
          { icon: ListOrdered, cmd: 'insertOrderedList' },
        ].map(({ icon: Icon, cmd }) => (
          <button
            key={cmd}
            type="button"
            className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-brand)] hover:bg-[var(--admin-brand-soft)] transition-colors"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(cmd)}
          >
            <Icon size={16} />
          </button>
        ))}
        <button
          type="button"
          className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-brand)]"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = window.prompt('URL');
            if (url) exec('createLink', url);
          }}
        >
          <Link size={16} />
        </button>
      </motion.div>
      <motion.div
        ref={ref}
        contentEditable
        role="textbox"
        aria-label={placeholder}
        className="admin-rich-editor-body px-4 py-3 text-sm text-[var(--admin-text)] outline-none focus:ring-2 focus:ring-[var(--admin-brand)]/20"
        style={{ minHeight }}
        onInput={() => ref.current && onChange(ref.current.innerHTML)}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </motion.div>
  );
};

export default AdminRichTextEditor;
