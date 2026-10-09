'use client'

import { useState } from 'react'
import AppDialog from '@/components/ui/AppDialog'

export default function BrassOptionsHelp() {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" aria-label="Как выбрать изготовление и точность прутка" aria-haspopup="dialog" aria-expanded={open}
      onClick={() => setOpen(true)}
      style={{ position: 'absolute', top: 2, right: 4, width: 32, height: 32, display: 'grid', placeItems: 'center', border: 'none', borderRadius: '50%', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7v1"/></svg>
    </button>
    {open && <AppDialog title="Изготовление и точность прутка" onClose={() => setOpen(false)} width={540} backdrop="clear">
      <div className="ui-dialog-shell" style={{ maxHeight: '80dvh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h2 style={{ margin: 0, flex: 1, fontSize: 16 }}>Как выбрать параметры прутка</h2>
          <button type="button" data-dialog-close="" className="ui-icon-button" aria-label="Закрыть пояснение">✕</button>
        </div>
        <div style={{ padding: '16px 20px', overflowY: 'auto', fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>
          <p style={{ marginTop: 0 }}>Смотрите полное обозначение в счёте или сертификате. Марка латуни, например Л63, сама по себе не определяет изготовление и точность.</p>
          <p><b>Изготовление:</b> первая буква <b>Д</b> — тянутый (холоднодеформированный); <b>Г</b> — прессованный (горячедеформированный). Выбирайте вариант из обозначения поставки.</p>
          <p><b>Точность:</b> буква сразу после сечения КР, КВ или ШГ: <b>Н</b> — нормальная, <b>П</b> — повышенная, <b>В</b> — высокая. Следующая буква обозначает состояние материала, а не точность.</p>
          <p style={{ marginBottom: 6 }}><b>Где искать буквы в наименовании:</b></p>
          <p style={{ padding: 10, background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', marginTop: 0 }}>Пруток <b style={{ color: 'var(--primary)' }}>Д</b>КР<b style={{ color: 'var(--primary)' }}>Н</b>Т 12 НД ЛС63-3 ГОСТ 2060-2006<br /><span style={{ color: 'var(--on-surface-variant)' }}>Д · КР · Н · Т → тянутый · круглый · нормальная точность · твёрдый.</span></p>
          <p style={{ padding: 10, background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)' }}>Пруток <b style={{ color: 'var(--primary)' }}>Г</b>КВ<b style={{ color: 'var(--primary)' }}>Н</b>Х 24 НД ЛЖС58-1-1 ГОСТ 2060-2006<br /><span style={{ color: 'var(--on-surface-variant)' }}>Г · КВ · Н · Х → прессованный · квадратный · нормальная точность · состояние не указано.</span></p>
          <p>У тянутого прутка обычно меньше отклонение размера. Поэтому изготовление меняет диапазон массы. Высокая точность доступна для тянутых круглых прутков.</p>
          <p>По умолчанию: <b>прессованный, нормальная точность</b>. Если в наименовании параметров нет, уточните их у поставщика; это исходный выбор калькулятора.</p>
          <a href="https://files.stroyinf.ru/Data2/1/4293843/4293843785.htm" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>ГОСТ 2060-2006, пункт 4.6 · обозначения, таблицы 1 и 2 · допуски</a>
        </div>
      </div>
    </AppDialog>}
  </>
}
