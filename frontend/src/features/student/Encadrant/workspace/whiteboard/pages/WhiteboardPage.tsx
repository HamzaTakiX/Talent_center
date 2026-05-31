import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useWhiteboardPlatform } from '../hooks/useWhiteboardPlatform';
import { useWhiteboardPreferences } from '../hooks/useWhiteboardPreferences';
import WhiteboardTopBar from '../components/WhiteboardTopBar';
import WhiteboardVersionHistoryPanel from '../components/WhiteboardVersionHistoryPanel';
import WhiteboardCanvasShell from '../components/WhiteboardCanvasShell';
import WhiteboardBackgroundLayer from '../components/WhiteboardBackgroundLayer';
import WhiteboardSettingsModal from '../components/WhiteboardSettingsModal';
import { resetWhiteboardInitialSceneCache } from '../components/ExcalidrawEditor';
import { resolveCanvasBackgroundColor } from '../utils/whiteboardColorUtils';

const WhiteboardPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const personalization = useWhiteboardPreferences();
  const canvasFill = resolveCanvasBackgroundColor(
    personalization.prefs.backgroundColor,
    personalization.prefs.backgroundOpacity,
  );
  const platform = useWhiteboardPlatform(
    personalization.prefs.backgroundColor,
    personalization.prefs.backgroundOpacity,
  );
  const [shareToast, setShareToast] = useState(false);
  const { setShareOpen } = platform;

  useEffect(() => () => resetWhiteboardInitialSceneCache(), []);

  const handleShare = useCallback(() => {
    setShareOpen((v) => !v);
    const url = window.location.href;
    void navigator.clipboard?.writeText(url);
    setShareToast(true);
    window.setTimeout(() => setShareToast(false), 2800);
  }, [setShareOpen]);

  return (
    <div
      data-admin-theme={personalization.theme}
      className="student-whiteboard-app flex h-[100dvh] w-full flex-col overflow-hidden font-inter antialiased"
    >
      <WhiteboardTopBar
        onSave={platform.saveBoard}
        onExportPng={() => void platform.exportPng()}
        onExportPdf={() => void platform.exportPdf()}
        onShare={handleShare}
        onOpenVersions={() => platform.setVersionPanelOpen(true)}
        savedLabel={platform.savedLabel}
        autoSaveEnabled={platform.autoSaveEnabled}
        onAutoSaveChange={platform.setAutoSave}
        isExporting={platform.isExporting}
        shareOpen={platform.shareOpen}
        theme={personalization.theme}
        onThemeToggle={personalization.toggleTheme}
        onLanguageSelect={personalization.setLanguage}
        onOpenSettings={() => personalization.setSettingsOpen(true)}
      />

      <main className="student-whiteboard-canvas relative min-h-0 flex-1">
        <WhiteboardBackgroundLayer color={canvasFill} type={personalization.prefs.backgroundType} />
        <WhiteboardCanvasShell
          onApiReady={platform.setApi}
          theme={personalization.theme}
          backgroundColor={personalization.prefs.backgroundColor}
          backgroundOpacity={personalization.prefs.backgroundOpacity}
          backgroundType={personalization.prefs.backgroundType}
        />
      </main>

      <WhiteboardVersionHistoryPanel
        open={platform.versionPanelOpen}
        onClose={() => platform.setVersionPanelOpen(false)}
        versions={platform.versions}
        activeVersionId={platform.activeVersionId}
        onRestore={platform.restoreVersion}
      />

      <WhiteboardSettingsModal
        open={personalization.settingsOpen}
        onClose={() => personalization.setSettingsOpen(false)}
        theme={personalization.theme}
        prefs={personalization.prefs}
        onThemeChange={personalization.setThemePreference}
        onBackgroundAppearanceChange={personalization.setBackgroundAppearance}
        onBackgroundTypeChange={personalization.setBackgroundType}
      />

      {shareToast && (
        <div className="student-whiteboard-toast" role="status">
          {t('student.encadrant.workspace.whiteboardPage.shareCopied')}
        </div>
      )}
    </div>
  );
};

export default WhiteboardPage;
