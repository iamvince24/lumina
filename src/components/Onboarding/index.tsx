/**
 * Onboarding 組件
 * 使用 react-joyride 實作引導流程
 */

'use client';

import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useAuthStore } from '@/stores/authStore';

/**
 * Onboarding 步驟
 */
const steps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">歡迎使用 Lumina！</h2>
        <p>讓我們花 1 分鐘了解如何使用 Lumina 進行輸出導向學習。</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.mindmap-editor',
    content: '這是心智圖編輯器，你可以在這裡記錄每天的學習內容。',
    disableBeacon: true,
  },
  {
    target: '.view-switcher',
    content: '你可以切換不同視圖：放射狀、大綱、邏輯圖。',
    disableBeacon: true,
  },
  {
    target: '.topic-sidebar',
    content: 'Topic 系統會自動累積你的輸出，形成知識演化軌跡。',
    disableBeacon: true,
  },
];

interface OnboardingProps {
  /** 是否為新使用者 */
  isNewUser: boolean;
}

/**
 * Onboarding 組件
 */
export function Onboarding({ isNewUser }: OnboardingProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // 檢查是否已完成 Onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');

    if (isNewUser && !hasCompletedOnboarding) {
      // 延遲 1 秒後開始（讓頁面先載入）
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isNewUser]);

  /**
   * 處理 Onboarding 完成
   */
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);

      // 標記為已完成
      localStorage.setItem('onboarding_completed', 'true');
    }
  };

  if (!run) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          zIndex: 10000,
        },
      }}
      locale={{
        back: '上一步',
        close: '關閉',
        last: '完成',
        next: '下一步',
        skip: '跳過',
      }}
    />
  );
}
