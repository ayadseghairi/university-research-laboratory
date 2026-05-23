import { ExpenseCategory, Language } from '@prisma/client';

// Email translations for different languages
const EMAIL_TRANSLATIONS = {
  ar: {
    platformName: 'منصة إدارة ميزانية المختبر',
    systemName: 'نظام إدارة الطلبات والصرفيات',
    newExpenseRequest: '🔔 إشعار: طلب صرف جديد',
    expenseDetails: 'تفاصيل الطلب',
    requestDate: 'تاريخ الطلب',
    titleLabel: 'العنوان',
    amountLabel: 'المبلغ',
    categoryLabel: 'الفئة',
    submitterLabel: 'المقدم',
    teamLabel: 'الفريق',
    currency: 'دج',
    reviewInstruction: 'يرجى مراجعة الطلب في لوحة التحكم واتخاذ الإجراء المناسب (قبول/رفض)',
    automaticMessage: 'هذه رسالة آلية من منصة إدارة ميزانية المختبر',
    noReply: 'لا تقم بالرد على هذه الرسالة مباشرة',
    direction: 'rtl',
    textAlign: 'right',
  },
  fr: {
    platformName: 'Plateforme de gestion budgétaire du laboratoire',
    systemName: 'Système de gestion des demandes et dépenses',
    newExpenseRequest: '🔔 Notification: Nouvelle demande de dépense',
    expenseDetails: 'Détails de la demande',
    requestDate: 'Date de la demande',
    titleLabel: 'Titre',
    amountLabel: 'Montant',
    categoryLabel: 'Catégorie',
    submitterLabel: 'Demandeur',
    teamLabel: 'Équipe',
    currency: 'DA',
    reviewInstruction: 'Veuillez examiner la demande dans le tableau de bord et prendre les mesures appropriées (approuver/rejeter)',
    automaticMessage: 'Ceci est un message automatique de la plateforme de gestion budgétaire du laboratoire',
    noReply: 'Veuillez ne pas répondre directement à ce message',
    direction: 'ltr',
    textAlign: 'left',
  },
  en: {
    platformName: 'Laboratory Budget Management Platform',
    systemName: 'Request and Expense Management System',
    newExpenseRequest: '🔔 Alert: New Expense Request',
    expenseDetails: 'Request Details',
    requestDate: 'Request Date',
    titleLabel: 'Title',
    amountLabel: 'Amount',
    categoryLabel: 'Category',
    submitterLabel: 'Submitter',
    teamLabel: 'Team',
    currency: 'DA',
    reviewInstruction: 'Please review the request in the dashboard and take appropriate action (approve/reject)',
    automaticMessage: 'This is an automatic message from the Laboratory Budget Management Platform',
    noReply: 'Please do not reply directly to this message',
    direction: 'ltr',
    textAlign: 'left',
  },
};

type TranslationKeys = keyof typeof EMAIL_TRANSLATIONS.ar;

export const getEmailTranslation = (language: Language, key: TranslationKeys): string => {
  const translations = EMAIL_TRANSLATIONS[language.toLowerCase() as keyof typeof EMAIL_TRANSLATIONS] || EMAIL_TRANSLATIONS.ar;
  return translations[key] as string;
};

// Category labels for email
const CATEGORY_LABELS: Record<ExpenseCategory, Record<Language, string>> = {
  RESEARCH_DEVELOPMENT: { AR: 'بحث وتطوير', FR: 'Recherche et développement', EN: 'Research & Development' },
  LAB_MATERIALS: { AR: 'مواد مخبرية', FR: 'Matériaux de laboratoire', EN: 'Lab Materials' },
  SCIENTIFIC_PUBLISHING: { AR: 'نشر علمي', FR: 'Publication scientifique', EN: 'Scientific Publishing' },
  EQUIPMENT: { AR: 'معدات علمية', FR: 'Équipement scientifique', EN: 'Scientific Equipment' },
  FIELD_RESEARCH: { AR: 'بحث ميداني', FR: 'Recherche sur terrain', EN: 'Field Research' },
  RESEARCHER_REWARDS: { AR: 'مكافآت الباحثين', FR: 'Récompenses des chercheurs', EN: 'Researcher Rewards' },
};

export const getCategoryLabel = (category: ExpenseCategory, language: Language): string => {
  return CATEGORY_LABELS[category][language] || CATEGORY_LABELS[category].AR;
};

export const buildExpenseCreatedEmailHtml = (payload: {
  title: string;
  amount: string;
  category: ExpenseCategory;
  requesterName: string;
  teamName: string;
  createdAt: Date;
  language: Language;
}): string => {
  const lang = payload.language;
  const t = (key: TranslationKeys) => getEmailTranslation(lang, key);
  const isRTL = lang === Language.AR;

  const formattedDate = new Date(payload.createdAt).toLocaleDateString(
    lang === Language.AR ? 'ar-DZ' : lang === Language.FR ? 'fr-DZ' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const categoryLabel = getCategoryLabel(payload.category, lang);
  const direction = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'right' : 'left';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #1a1a1a; direction: ${direction}; text-align: ${textAlign};">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${t('platformName')}</h1>
        <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">${t('systemName')}</p>
      </div>

      <!-- Content -->
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #667eea; margin-top: 0; margin-bottom: 20px; font-size: 22px;">${t('newExpenseRequest')}</h2>
        
        <p style="color: #666; margin-bottom: 25px; font-size: 15px;">
          ${lang === Language.AR ? 'تم تقديم طلب صرف جديد في النظام ويتطلب مراجعتك.' : lang === Language.FR ? 'Une nouvelle demande de dépense a été soumise au système et nécessite votre examen.' : 'A new expense request has been submitted to the system and requires your review.'}
        </p>

        <!-- Details Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 600; color: #667eea; width: 35%;">${t('titleLabel')}</td>
              <td style="padding: 12px; color: #333;">${payload.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
              <td style="padding: 12px; font-weight: 600; color: #667eea;">${t('amountLabel')}</td>
              <td style="padding: 12px; color: #333; font-weight: 600; font-size: 16px;">${payload.amount} ${t('currency')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 600; color: #667eea;">${t('categoryLabel')}</td>
              <td style="padding: 12px; color: #333;">${categoryLabel}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
              <td style="padding: 12px; font-weight: 600; color: #667eea;">${t('submitterLabel')}</td>
              <td style="padding: 12px; color: #333;">${payload.requesterName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 600; color: #667eea;">${t('teamLabel')}</td>
              <td style="padding: 12px; color: #333;">${payload.teamName}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 12px; font-weight: 600; color: #667eea;">${t('requestDate')}</td>
              <td style="padding: 12px; color: #333;">${formattedDate}</td>
            </tr>
          </tbody>
        </table>

        <!-- Action Note -->
        <div style="background: #eff6ff; border-${isRTL ? 'right' : 'left'}: 4px solid #667eea; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            ✓ ${t('reviewInstruction')}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #666; font-size: 12px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0;">${t('automaticMessage')}</p>
        <p style="margin: 8px 0 0; color: #999;">${t('noReply')}</p>
      </div>
    </div>
  `;
};
