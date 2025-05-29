'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('links');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, left: number, delay: number}>>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    // Hide loading overlay after component mounts
    const loadingOverlay = document.querySelector('.loading-overlay') as HTMLElement;
    if (loadingOverlay) {
      setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.visibility = 'hidden';
      }, 500);
    }

    // Initialize particles
    const particleArray = [];
    for (let i = 0; i < 20; i++) {
      particleArray.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6
      });
    }
    setParticles(particleArray);

    // Apply initial theme
    document.body.className = 'dark';
  }, []);

  useEffect(() => {
    // Update theme when isDarkMode changes
    document.body.className = isDarkMode ? '' : 'light';
  }, [isDarkMode]);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleEmailCopy = async () => {
    try {
      await navigator.clipboard.writeText('taishi@alphabyte.co.jp');
      setCopyNotification(true);
      setTimeout(() => setCopyNotification(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleContactFormToggle = () => {
    setShowContactForm(!showContactForm);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create mailto link with form data
    const subject = encodeURIComponent(formData.subject || 'お問い合わせ');
    const body = encodeURIComponent(
      `お名前: ${formData.name}\nメールアドレス: ${formData.email}\n\nメッセージ:\n${formData.message}`
    );
    window.open(`mailto:taishi@alphabyte.co.jp?subject=${subject}&body=${body}`);
    setIsEmailModalOpen(false);
    setShowContactForm(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const socialLinks = [
    {
      name: 'Note メンバーシップ',
      url: 'https://note.com/taishiyade/membership',
      color: '#41C9B4',
      icon: 'fas fa-edit',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@taishiyade',
      color: '#FF0000',
      icon: 'fab fa-youtube',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/taishi_jade',
      color: '#E1306C',
      icon: 'fab fa-instagram',
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@taishi_yade',
      color: '#000000',
      icon: 'fab fa-tiktok',
    },
    {
      name: 'Solomaker',
      url: 'https://www.solomaker.dev/',
      color: '#4A5568',
      icon: 'fas fa-rocket',
    },
    {
      name: 'Discord',
      url: 'https://discord.com/invite/RjJf4H5TK2',
      color: '#5865F2',
      icon: 'fab fa-discord',
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/taishi_jade',
      color: '#1DA1F2',
      icon: 'fab fa-twitter',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/taishi-yamasaki/',
      color: '#0A66C2',
      icon: 'fab fa-linkedin',
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/taishi.yamasaki.98/',
      color: '#1877F2',
      icon: 'fab fa-facebook',
    },
  ];

  const speakingEngagements = [
    {
      title: 'Today I Learned -シリコンバレーの現場から- ポッドキャスト出演（前編）',
      description: 'ユーザーを熱狂させるAIビジネスの考え方/作り方',
    },
    {
      title: 'Today I Learned -シリコンバレーの現場から- ポッドキャスト出演（後編）',
      description: '英語圏の情報リーチへの仕方/シリコンバレーと日本のスタートアップの違い',
    },
    {
      title: 'はろーわーるど！ポッドキャスト出演',
      description: '元シリコンバレーCTO、生成AIでサービスを作りまくっている話',
    },
    {
      title: 'はろーわーるど！ポッドキャスト出演（新エピソード）',
      description: '日本版Product Hunt、SolomakerをリリースしたTaishiさんとAIについて話しました',
    },
    {
      title: 'AI駆動開発(AI-Driven Development) 勉強会（第5回）',
      description: 'AI駆動開発に関する勉強会での講演',
    },
    {
      title: '「AI Code Agents 祭り」~ 2025 Winter ~',
      description: 'AI Code Agentsに関するイベントでの講演',
    },
  ];

  const products = [
    {
      title: 'Solomaker',
      description: '個人開発者のためのコミュニティプラットフォーム',
      detail: '個人開発者同士が繋がり、プロダクトを共有し、フィードバックを得られる場所',
      link: 'https://www.solomaker.dev/',
    },
  ];

  const writings = [
    {
      title: '1人1000億円時代に備えて僕がSolomaker.devをつくった理由',
      description: '個人開発者向けプラットフォーム開発の背景',
      link: 'https://www.solomaker.dev/articles/4e5a5bee-f8f9-4fc0-9b46-83aab6a61031',
    },
    {
      title: 'X運用6ヶ月でフォロワー0人→1万人にした具体的な方法',
      description: 'SNS運用のノウハウと実践方法',
      link: 'https://note.com/taishiyade/n/n406400752f09',
    },
    {
      title: '【アプリ69個】マネタイズ可能なアイデア無料公開【個人開発/スタートアップ/新規事業】',
      description: '個人開発者向けのビジネスアイデア集',
      link: 'https://note.com/taishiyade/n/n369c949a5bb8?from=membership-note',
    },
    {
      title: '【最速収益化】個人開発者がYouTube歴2週間で登録者数2000人突破した話',
      description: 'YouTubeでの収益化戦略と実践例',
      link: 'https://note.com/taishiyade/n/ne5fdbdec86f6',
    },
    {
      title: '海外のIndie Hackerと比較して、日本の個人開発者に圧倒的に足りないこと3つ',
      description: 'グローバル視点での個人開発者の課題分析',
      link: 'https://www.solomaker.dev/articles/7835e7fa-9776-4b69-937d-c5c3d73cb903',
    },
  ];

  return (
    <>
      {/* Loading Overlay */}
      <div className="loading-overlay">
        <div className="loading-spinner">
          <span className="spinner-text">T</span>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="dark-mode-toggle" onClick={toggleDarkMode}>
        <i className={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'} />
      </div>

      {/* Particles */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Background Shapes */}
      <div className="bg-shapes">
        <div className="shape shape2" />
        <div className="shape shape4" />
      </div>

      {/* Main Container */}
      <div className="container">
        <div className="profile-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="gradient-circle" />
            <div
              className="profile-img clickable"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <img
                src="https://ext.same-assets.com/2753886499/3037536827.png"
                alt="taishiyade Profile"
                className="profile-image"
                width="112"
                height="112"
              />
              <div className="avatar-placeholder">
                <i className="fas fa-user" />
              </div>
            </div>
            <h1
              id="taishiyade-title"
              className="glitch-effect clickable"
              data-text="taishiyade"
              onClick={() => setIsProfileModalOpen(true)}
            >
              taishiyade
            </h1>

            <div className="bio-container">
              <ul className="bio-list">
                <li>
                  <a href="https://www.solomaker.dev/" target="_blank" rel="noopener noreferrer">
                    solomaker.dev
                  </a> の作者
                </li>
                <li>
                  <a href="https://diamond.jp/articles/-/334554" target="_blank" rel="noopener noreferrer">
                    元シリコンバレーCTO
                  </a>の個人開発者
                </li>
                <li>
                  <a href="https://alphabyte.co.jp/" target="_blank" rel="noopener noreferrer">
                    現AlphaByte, Inc CEO
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@taishiyade" target="_blank" rel="noopener noreferrer">
                    YouTubeでグローバルアプリで100万円までを配信中
                  </a>
                </li>
                <li>AI×CTOチームで爆速開発</li>
                <li>
                  <a href="https://diamond.jp/articles/-/334554" target="_blank" rel="noopener noreferrer">
                    日本人初Snapchatアクセラ採択出資
                  </a>
                </li>
                <li>国際結婚</li>
              </ul>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="achievements-section">
            <div className="tabs-container">
              <div
                className={`tab ${activeTab === 'links' ? 'active' : ''}`}
                onClick={() => handleTabClick('links')}
              >
                リンク集
              </div>
              <div
                className={`tab ${activeTab === 'speaking' ? 'active' : ''}`}
                onClick={() => handleTabClick('speaking')}
              >
                出演実績
              </div>
              <div
                className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => handleTabClick('products')}
              >
                プロダクト一覧
              </div>
              <div
                className={`tab ${activeTab === 'writing' ? 'active' : ''}`}
                onClick={() => handleTabClick('writing')}
              >
                執筆
              </div>
            </div>

            {/* Links Tab Content */}
            <div
              className={`tab-content ${activeTab === 'links' ? 'active' : ''}`}
            >
              <div className="links-container">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    className="link-item"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      '--accent-color': link.color,
                      opacity: 1,
                      transform: 'translateY(0px)',
                      transition: '0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    } as React.CSSProperties}
                  >
                    <div className="link-icon">
                      <i className={link.icon} />
                    </div>
                    <div className="link-text">{link.name}</div>
                  </a>
                ))}
                <div
                  className="link-item"
                  onClick={() => setIsEmailModalOpen(true)}
                  style={{
                    '--accent-color': '#EA4335',
                    opacity: 1,
                    transform: 'translateY(0px)',
                    transition: '0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer',
                  } as React.CSSProperties}
                >
                  <div className="link-icon">
                    <i className="fas fa-envelope" />
                  </div>
                  <div className="link-text">メールでのお問い合わせ</div>
                </div>
              </div>
            </div>

            {/* Speaking Tab Content */}
            <div
              className={`tab-content ${activeTab === 'speaking' ? 'active' : ''}`}
            >
              {speakingEngagements.map((item) => (
                <div key={item.title} className="achievement-item">
                  <div className="achievement-details">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Products Tab Content */}
            <div
              className={`tab-content ${activeTab === 'products' ? 'active' : ''}`}
            >
              {products.map((product) => (
                <div key={product.title} className="achievement-item">
                  <div className="achievement-details">
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <p>{product.detail}</p>
                    <a href={product.link} className="achievement-link" target="_blank" rel="noopener noreferrer">
                      サイトを訪問する
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Writing Tab Content */}
            <div
              className={`tab-content ${activeTab === 'writing' ? 'active' : ''}`}
            >
              {writings.map((writing) => (
                <div key={writing.title} className="achievement-item">
                  <div className="achievement-details">
                    <h3>{writing.title}</h3>
                    <p>{writing.description}</p>
                    <a href={writing.link} className="achievement-link" target="_blank" rel="noopener noreferrer">
                      記事を読む
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer>
            <p className="copyright">© 2025 taishiyade - All Rights Reserved</p>
          </footer>
        </div>
      </div>

      {/* Profile Modal */}
      <div className={`modal ${isProfileModalOpen ? 'show' : ''}`}>
        <div className="modal-content">
          <span
            className="close-modal"
            onClick={() => setIsProfileModalOpen(false)}
          >
            ×
          </span>
          <h2>山崎 大志</h2>
          <h3>株式会社AlphaByte 代表取締役CEO</h3>
          <div className="modal-bio">
            <p>
              2016年よりフリーランスモバイルアプリ開発者として独立し、文部科学省が展開する「トビタテ！留学JAPAN」日本代表プログラムに採択され、アントレプレナーシップとエンジニアリングを学ぶため、インドのバンガロールとアメリカのシリコンバレーに留学。
            </p>
            <p>
              その後スタートアップ企業を中心に10社以上のプロダクト開発を支援。米国YCombinator出身のMakeSchoolにてモバイルアプリインストラクターを務める。
            </p>
            <p>
              2018年、サンフランシスコにてZ世代向けメンタルヘルスアプリWaffleJournalを開発するPoppyAI,Inc.を創業、CTOに就任。日米から累計3億円を資金調達し、プロダクト開発、グロース戦略、データ分析、採用、チームビルディングなどに従事。
            </p>
            <p>
              2021年、SnapInc.(Snapchat)が運営するアクセラレータープログラム「Yellow」に日本人として初採択。
            </p>
            <p>
              2023年、株式会社AlphaByteを設立。複数のスタートアップのシステム開発やグローバル採用のコンサルティング。生成AI領域での自社プロダクト開発を行っている。
            </p>
            <p>
              2024年、日本からグローバルへのプロダクトグロースを支援、シリコンバレーのスタートアップの日本市場への参入をサポートするSolomaker.devをリリース。日本のプロダクト開発者が集うプラットフォームとして数万人が利用している。
            </p>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <div className={`modal ${isEmailModalOpen ? 'show' : ''}`}>
        <div className="modal-content">
          <span
            className="close-modal"
            onClick={() => setIsEmailModalOpen(false)}
          >
            ×
          </span>
          <h2>メールでのお問い合わせ</h2>

          {!showContactForm ? (
            <div className="email-options">
              <button onClick={handleContactFormToggle} className="email-btn">
                お問い合わせフォーム
              </button>
              <a href="mailto:taishi@alphabyte.co.jp" className="email-btn">
                直接メールを送る
              </a>
              <button onClick={handleEmailCopy} className="email-btn">
                メールアドレスをコピー
              </button>
              <div
                id="copy-notification"
                className={copyNotification ? 'show' : ''}
              >
                コピーしました！
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">お名前 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="山田太郎"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">メールアドレス *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="example@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">件名</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="お問い合わせの件名"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">メッセージ *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="お問い合わせ内容をご記入ください..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="form-btn primary">
                  送信
                </button>
                <button
                  type="button"
                  className="form-btn secondary"
                  onClick={handleContactFormToggle}
                >
                  戻る
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
