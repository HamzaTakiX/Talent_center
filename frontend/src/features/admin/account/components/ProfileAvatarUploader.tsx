import { ChangeEvent, FunctionComponent, RefObject } from 'react';
import { Camera, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileAvatarUploaderProps {
  initials: string;
  avatarPreview: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Afficher le lien « Changer la photo » sous l’avatar (désactivé si actions externes). */
  showChangeLink?: boolean;
}

const ProfileAvatarUploader: FunctionComponent<ProfileAvatarUploaderProps> = ({
  initials,
  avatarPreview,
  fileInputRef,
  onFileChange,
  showChangeLink = true,
}) => {
  const { t } = useTranslation();
  const openPicker = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <div className="relative">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt={t('admin.account.avatarAlt')}
            className="admin-avatar-image h-28 w-28 rounded-2xl object-cover ring-4 ring-[var(--admin-bg-elevated)] sm:h-32 sm:w-32"
          />
        ) : (
          <span
            className="admin-avatar-placeholder flex h-28 w-28 items-center justify-center rounded-2xl text-2xl font-bold text-white ring-4 ring-[var(--admin-bg-elevated)] sm:h-32 sm:w-32"
          >
            {initials}
          </span>
        )}

        <button
          type="button"
          onClick={openPicker}
          className="admin-avatar-upload-btn absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl shadow-admin-md"
          aria-label="Changer la photo de profil"
        >
          <Camera className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={onFileChange}
        tabIndex={-1}
      />

      {showChangeLink ? (
        <button
          type="button"
          onClick={openPicker}
          className="admin-avatar-upload-link inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
        >
          <ImagePlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {t('admin.account.changePhoto')}
        </button>
      ) : null}
    </div>
  );
};

export default ProfileAvatarUploader;
