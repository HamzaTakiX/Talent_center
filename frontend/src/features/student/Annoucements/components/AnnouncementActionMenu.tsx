import { FunctionComponent, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import {

  Bookmark,

  EyeOff,

  MoreVertical,

  ThumbsUp,

  VolumeX,

} from 'lucide-react';

import {

  ANNOUNCEMENT_MENU_ITEM,

  ANNOUNCEMENT_MENU_PANEL,

} from '../constants/allAnnouncementsStyles';



interface AnnouncementActionMenuProps {

  announcementId: string;

}



const menuItems = [

  { actionKey: 'save', icon: Bookmark },

  { actionKey: 'favorType', icon: ThumbsUp },

  { actionKey: 'muteType', icon: VolumeX },

  { actionKey: 'hide', icon: EyeOff },

] as const;



const AnnouncementActionMenu: FunctionComponent<AnnouncementActionMenuProps> = ({

  announcementId,

}) => {

  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {

      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {

        setOpen(false);

      }

    };

    const onKeyDown = (event: KeyboardEvent) => {

      if (event.key === 'Escape') setOpen(false);

    };

    document.addEventListener('mousedown', onPointerDown);

    document.addEventListener('keydown', onKeyDown);

    return () => {

      document.removeEventListener('mousedown', onPointerDown);

      document.removeEventListener('keydown', onKeyDown);

    };

  }, [open]);



  return (

    <div ref={rootRef} className="relative shrink-0">

      <button

        type="button"

        onClick={() => setOpen((prev) => !prev)}

        aria-expanded={open}

        aria-haspopup="menu"

        aria-label={t('student.announcements.actions.menuAria', { id: announcementId })}

        className={`admin-icon-btn admin-icon-btn--md !size-8 border-0 ${open ? 'text-[var(--admin-text)]' : ''}`}

      >

        <MoreVertical className="size-[18px]" strokeWidth={1.75} aria-hidden />

      </button>



      {open ? (

        <div

          role="menu"

          className={`${ANNOUNCEMENT_MENU_PANEL} student-announcement-menu-panel`}

        >

          {menuItems.map(({ actionKey, icon: Icon }) => (

            <button

              key={actionKey}

              type="button"

              role="menuitem"

              className={ANNOUNCEMENT_MENU_ITEM}

              onClick={() => setOpen(false)}

            >

              <Icon className="size-4 shrink-0 text-[var(--admin-text-muted)]" strokeWidth={1.75} aria-hidden />

              <span className="min-w-0 truncate">{t(`student.announcements.actions.${actionKey}`)}</span>

            </button>

          ))}

        </div>

      ) : null}

    </div>

  );

};



export default AnnouncementActionMenu;

