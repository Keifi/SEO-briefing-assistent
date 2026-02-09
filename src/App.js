import React, { useState } from 'react';
import { FileText, Upload, Download, Plus, Trash2, FileUp, Copy } from 'lucide-react';

const SEOBriefingGenerator = () => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [showBriefing, setShowBriefing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [keywordVariations, setKeywordVariations] = useState('');
  const [longTailKeywords, setLongTailKeywords] = useState('');
  const [questions, setQuestions] = useState('');
  const [competitor, setCompetitor] = useState('');

  const resetForm = () => {
    setProjectName('');
    setMainKeyword('');
    setKeywordVariations('');
    setLongTailKeywords('');
    setQuestions('');
    setCompetitor('');
    setCurrentProject(null);
    setShowBriefing(false);
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Upload een geldig PDF bestand');
      return;
    }

    setIsProcessing(true);

    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            resolve(result.split(',')[1]);
          } else {
            reject(new Error('Ongeldig bestandsformaat'));
          }
        };
        reader.onerror = () => reject(new Error('Fout bij lezen bestand'));
        reader.readAsDataURL(file);
      });

      // Call our backend API function instead of Anthropic directly
      const response = await fetch("/api/analyze-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfData: base64Data
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'API call failed');
      }

      const parsedData = await response.json();

      if (parsedData.mainKeyword) {
        setMainKeyword(parsedData.mainKeyword);
        if (!projectName) {
          setProjectName(parsedData.mainKeyword);
        }
      }
      
      if (parsedData.variations?.length > 0) {
        setKeywordVariations(parsedData.variations.join('\n'));
      }
      
      if (parsedData.longTail?.length > 0) {
        setLongTailKeywords(parsedData.longTail.join('\n'));
      }
      
      if (parsedData.questions?.length > 0) {
        setQuestions(parsedData.questions.join('\n'));
      }

      alert('✅ SEMrush data succesvol geïmporteerd!');

    } catch (error) {
      console.error('PDF processing error:', error);
      alert('Er ging iets mis bij het verwerken van het PDF. Probeer het opnieuw.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const generateBriefing = () => {
    if (!mainKeyword.trim()) {
      alert('Voer minimaal een hoofdzoekwoord in');
      return;
    }

    const briefing = {
      id: currentProject?.id || Date.now(),
      name: projectName || mainKeyword,
      createdAt: new Date().toLocaleString('nl-NL'),
      keywords: {
        main: mainKeyword,
        variations: keywordVariations.split('\n').filter(k => k.trim()),
        longTail: longTailKeywords.split('\n').filter(k => k.trim()),
        questions: questions.split('\n').filter(q => q.trim())
      },
      competitor: competitor,
      content: generateContent()
    };

    if (currentProject) {
      setProjects(projects.map(p => p.id === currentProject.id ? briefing : p));
    } else {
      setProjects([...projects, briefing]);
    }

    setCurrentProject(briefing);
    setShowBriefing(true);
  };

  const generateContent = () => {
    const mainKw = mainKeyword.trim();
    const variations = keywordVariations.split('\n').filter(k => k.trim());
    const qaList = questions.split('\n').filter(q => q.trim());

    const pluralKw = mainKw.endsWith('verf') ? mainKw : mainKw + 'en';
    const h1 = mainKw.charAt(0).toUpperCase() + mainKw.slice(1);

    const pageTitle = `${pluralKw.charAt(0).toUpperCase() + pluralKw.slice(1)} kopen | Slijtvast & eenvoudig aan te brengen`;
    const metaDescription = `${h1} kopen voor vloer en muur. Slijtvast, onderhoudsvriendelijk en geschikt voor elke ruimte. ✔ Snelle bezorging ✔ Veilig en achteraf betalen.`;

    const h2Commercial = `Wat is ${mainKw}?`;
    const commercialNotitie = 'De voordelen van gebruik van betonverf binnen op een rijtje zetten in bulletpoints. Het zoekwoord in de eerste regel al laat terugkomen. Noem 1x de hoofdcategorie';
    const commercialContent = `${h1} is speciaal ontwikkeld voor [korte omschrijving toepassing]. ${h1} biedt je:`;
    
    const benefits = [
      'Uitstekende dekking en duurzaamheid',
      'Slijtvast en bestand tegen dagelijks gebruik',
      'Eenvoudig aan te brengen, ook voor beginners',
      'Onderhoudsvriendelijk en makkelijk schoon te maken',
      'Geschikt voor verschillende ondergronden'
    ];

    const h2Info1 = `Wat is ${mainKw}?`;
    const info1Notitie = 'Geef gelijk antwoord op vraag. Benoem ook de toepassingen en ruimte. Duurzaamheid, milieuvriendelijk, voor elk interieur en tijdloos design';
    const info1Content = `${h1} is een verftype dat [specifieke eigenschappen]. Je gebruikt deze verf voor [toepassingen].\n\n` +
      `**Toepassingen:**\n` +
      `- [Toepassing 1]\n` +
      `- [Toepassing 2]\n` +
      `- [Toepassing 3]\n\n` +
      `**Geschikte ruimtes:**\n` +
      `- [Ruimte 1]\n` +
      `- [Ruimte 2]\n` +
      `- [Ruimte 3]\n\n` +
      `${h1} is duurzaam, milieuvriendelijk en past in elk interieur. Het tijdloze design zorgt ervoor dat je ruimte er jarenlang mooi uitziet.`;

    const h2Info2 = qaList.length > 0 && qaList[0].toLowerCase().includes('aanbrengen') 
      ? qaList[0] 
      : `Waarop moet je letten bij het aanbrengen van ${mainKw}?`;
    const info2Notitie = 'Geef gelijk antwoord op vraag en zo nodig handige tips';
    const info2Content = `Bij het aanbrengen van ${mainKw} let je op het volgende:\n\n` +
      `**Voorbereiding:**\n` +
      `Zorg dat de ondergrond schoon, droog en vetvrij is. Verwijder loszittende delen en vul eventuele scheuren op.\n\n` +
      `**Aanbrengen:**\n` +
      `Gebruik een kwast, roller of verfspuit, afhankelijk van de ondergrond en het gewenste resultaat. Breng de verf in dunne, gelijkmatige lagen aan.\n\n` +
      `**Handige tips:**\n` +
      `- Werk bij een temperatuur tussen 10-25°C\n` +
      `- Gebruik kwaliteitsgereedschap voor een strakke afwerking\n` +
      `- Laat elke laag goed drogen volgens de aangegeven droogtijd\n` +
      `- Breng minimaal 2 lagen aan voor optimale dekking`;

    return {
      landingspagina: mainKw,
      concurrentie: competitor || '[Voeg concurrent URL toe]',
      h1,
      zoekwoorden: `${mainKw}, ${variations.slice(0, 2).join(', ')}`,
      aantalWoorden: '200-300',
      sections: [
        {
          h2: h2Commercial,
          intent: 'Commercieel',
          notitie: commercialNotitie,
          content: commercialContent,
          bullets: benefits
        },
        {
          h2: h2Info1,
          intent: 'Informatief',
          notitie: info1Notitie,
          content: info1Content,
          bullets: []
        },
        {
          h2: h2Info2,
          intent: 'Informatief',
          notitie: info2Notitie,
          content: info2Content,
          bullets: []
        }
      ],
      meta: {
        pageTitle,
        metaDescription
      }
    };
  };

  const loadProject = (project) => {
    setCurrentProject(project);
    setProjectName(project.name);
    setMainKeyword(project.keywords.main);
    setKeywordVariations(project.keywords.variations.join('\n'));
    setLongTailKeywords(project.keywords.longTail.join('\n'));
    setQuestions(project.keywords.questions.join('\n'));
    setCompetitor(project.competitor);
    setShowBriefing(true);
    setActiveTab('input');
  };

  const deleteProject = (id) => {
    if (window.confirm('Weet je zeker dat je deze briefing wilt verwijderen?')) {
      setProjects(projects.filter(p => p.id !== id));
      if (currentProject?.id === id) {
        resetForm();
      }
    }
  };

  const exportToWord = () => {
    if (!currentProject) return;
    
    const content = currentProject.content;
    let docContent = `-------------------------------------------------------------------------------\n`;
    docContent += `SEO BRIEFING - ${currentProject.name.toUpperCase()}\n`;
    docContent += `-------------------------------------------------------------------------------\n\n`;
    docContent += `Landingspagina:     ${content.landingspagina}\n\n`;
    docContent += `Concurrentie:       ${content.concurrentie}\n\n`;
    docContent += `Notitie:            Als bovenstaande niet is ingevuld, zoek relevante\n`;
    docContent += `                    concurrentie in top 3 van Google.\n\n`;
    docContent += `-------------------------------------------------------------------------------\n\n`;
    docContent += `Pagetitel:          ${content.meta.pageTitle}\n\n`;
    docContent += `Meta-description:   ${content.meta.metaDescription}\n\n`;
    docContent += `-------------------------------------------------------------------------------\n\n`;
    docContent += `H1 html-tag:        ${content.h1}\n\n`;
    docContent += `Zoekwoorden:        ${content.zoekwoorden}\n\n`;
    
    const section1 = content.sections[0];
    docContent += `H2 html-tag:        ${section1.h2}\n\n`;
    docContent += `Notitie:            ${section1.notitie}\n\n`;
    docContent += `Content:            ${section1.content}\n\n`;
    if (section1.bullets.length > 0) {
      section1.bullets.forEach(bullet => {
        docContent += `                    - ${bullet}\n`;
      });
      docContent += '\n';
    }
    
    const section2 = content.sections[1];
    docContent += `H2 html-tag:        ${section2.h2}\n\n`;
    docContent += `Notitie:            ${section2.notitie}\n\n`;
    docContent += `Content:            ${section2.content.replace(/\n\n/g, '\n                    ')}\n\n`;
    
    const section3 = content.sections[2];
    docContent += `H2 html-tag:        ${section3.h2}\n\n`;
    docContent += `Notitie:            ${section3.notitie}\n\n`;
    docContent += `Content:            ${section3.content.replace(/\n\n/g, '\n                    ')}\n\n`;
    
    docContent += `-------------------------------------------------------------------------------\n\n`;
    docContent += `Aantal woorden:     ${content.aantalWoorden}\n\n`;
    docContent += `Notitie:            \n`;
    docContent += `-------------------------------------------------------------------------------\n\n`;
    
    docContent += `ZOEKWOORDEN OVERZICHT\n\n`;
    docContent += `Hoofdzoekwoord:     ${currentProject.keywords.main}\n\n`;
    if (currentProject.keywords.variations.length > 0) {
      docContent += `Variaties:\n`;
      currentProject.keywords.variations.forEach(k => {
        docContent += `                    - ${k}\n`;
      });
      docContent += '\n';
    }
    if (currentProject.keywords.longTail.length > 0) {
      docContent += `Long-tail:\n`;
      currentProject.keywords.longTail.forEach(k => {
        docContent += `                    - ${k}\n`;
      });
      docContent += '\n';
    }
    if (currentProject.keywords.questions.length > 0) {
      docContent += `Vragen:\n`;
      currentProject.keywords.questions.forEach(q => {
        docContent += `                    - ${q}\n`;
      });
    }
    
    docContent += `\n-------------------------------------------------------------------------------`;

    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SEO-Briefing-${currentProject.name.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!currentProject) return;
    
    const content = currentProject.content;
    let textContent = `-------------------------------------------------------------------------------\n`;
    textContent += `SEO BRIEFING - ${currentProject.name.toUpperCase()}\n`;
    textContent += `-------------------------------------------------------------------------------\n\n`;
    textContent += `Landingspagina:     ${content.landingspagina}\n\n`;
    textContent += `Concurrentie:       ${content.concurrentie}\n\n`;
    textContent += `Notitie:            Als bovenstaande niet is ingevuld, zoek relevante\n`;
    textContent += `                    concurrentie in top 3 van Google.\n\n`;
    textContent += `-------------------------------------------------------------------------------\n\n`;
    textContent += `Pagetitel:          ${content.meta.pageTitle}\n\n`;
    textContent += `Meta-description:   ${content.meta.metaDescription}\n\n`;
    textContent += `-------------------------------------------------------------------------------\n\n`;
    textContent += `H1 html-tag:        ${content.h1}\n\n`;
    textContent += `Zoekwoorden:        ${content.zoekwoorden}\n\n`;
    
    const section1 = content.sections[0];
    textContent += `H2 html-tag:        ${section1.h2}\n\n`;
    textContent += `Notitie:            ${section1.notitie}\n\n`;
    textContent += `Content:            ${section1.content}\n\n`;
    if (section1.bullets.length > 0) {
      section1.bullets.forEach(bullet => {
        textContent += `                    - ${bullet}\n`;
      });
      textContent += '\n';
    }
    
    const section2 = content.sections[1];
    textContent += `H2 html-tag:        ${section2.h2}\n\n`;
    textContent += `Notitie:            ${section2.notitie}\n\n`;
    textContent += `Content:            ${section2.content.replace(/\n\n/g, '\n                    ')}\n\n`;
    
    const section3 = content.sections[2];
    textContent += `H2 html-tag:        ${section3.h2}\n\n`;
    textContent += `Notitie:            ${section3.notitie}\n\n`;
    textContent += `Content:            ${section3.content.replace(/\n\n/g, '\n                    ')}\n\n`;
    
    textContent += `-------------------------------------------------------------------------------\n\n`;
    textContent += `Aantal woorden:     ${content.aantalWoorden}\n\n`;
    textContent += `Notitie:            \n`;
    textContent += `-------------------------------------------------------------------------------`;

    navigator.clipboard.writeText(textContent).then(() => {
      alert('✅ SEO briefing gekopieerd naar klembord!');
    }).catch(err => {
      console.error('Copy failed:', err);
      alert('❌ Kopiëren mislukt. Probeer het opnieuw.');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">SEO Briefing Generator</h1>
              <p className="text-slate-600">Verfwebwinkel.nl | Data-gedreven & EEAT-compliant</p>
            </div>
            <FileText className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Briefings</h2>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nieuw
                </button>
              </div>

              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">Nog geen briefings</p>
                ) : (
                  projects.map(project => (
                    <div
                      key={project.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        currentProject?.id === project.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => loadProject(project)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 text-sm">{project.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{project.createdAt}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-slate-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('input')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'input'
                        ? 'text-orange-500 border-b-2 border-orange-500'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1. Zoekwoordanalyse
                  </button>
                  <button
                    onClick={() => {
                      if (showBriefing) setActiveTab('briefing');
                    }}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'briefing'
                        ? 'text-orange-500 border-b-2 border-orange-500'
                        : showBriefing ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 cursor-not-allowed'
                    }`}
                    disabled={!showBriefing}
                  >
                    2. SEO Briefing
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'input' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FileUp className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-2">SEMrush PDF importeren</h3>
                          <p className="text-sm text-slate-600 mb-4">
                            Upload een SEMrush rapport (PDF) en de zoekwoorden worden automatisch geëxtraheerd en ingevuld.
                          </p>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" />
                            {isProcessing ? 'Bezig met verwerken...' : 'PDF uploaden'}
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handlePDFUpload}
                              disabled={isProcessing}
                              className="hidden"
                            />
                          </label>
                          {isProcessing && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              <span>PDF wordt geanalyseerd...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                      <p className="text-sm text-slate-500 mb-4">Of vul handmatig de zoekwoordanalyse in:</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Projectnaam
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="bijv. Betonverf voor binnen"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Hoofdzoekwoord *
                      </label>
                      <input
                        type="text"
                        value={mainKeyword}
                        onChange={(e) => setMainKeyword(e.target.value)}
                        placeholder="bijv. betonverf voor binnen"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Zoekwoordvariaties
                      </label>
                      <textarea
                        value={keywordVariations}
                        onChange={(e) => setKeywordVariations(e.target.value)}
                        placeholder="betonverf binnen&#10;beton verf voor binnen&#10;verf voor beton binnen&#10;(elke variatie op een nieuwe regel)"
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Long-tail zoekwoorden
                      </label>
                      <textarea
                        value={longTailKeywords}
                        onChange={(e) => setLongTailKeywords(e.target.value)}
                        placeholder="betonverf voor vloer binnen&#10;beste betonverf binnen&#10;betonverf badkamer binnen&#10;(elk zoekwoord op een nieuwe regel)"
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vragen (People Also Ask)
                      </label>
                      <textarea
                        value={questions}
                        onChange={(e) => setQuestions(e.target.value)}
                        placeholder="Hoe breng je betonverf aan?&#10;Wat is de beste betonverf voor binnen?&#10;Hoeveel lagen betonverf heb je nodig?&#10;(elke vraag op een nieuwe regel)"
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Concurrent URL (optioneel)
                      </label>
                      <input
                        type="text"
                        value={competitor}
                        onChange={(e) => setCompetitor(e.target.value)}
                        placeholder="https://www.concurrent.nl/pagina"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={generateBriefing}
                      className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Genereer SEO Briefing
                    </button>
                  </div>
                )}

                {activeTab === 'briefing' && currentProject && (
                  <div className="space-y-6">
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Kopieer briefing
                      </button>
                      <button
                        onClick={exportToWord}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download als .txt
                      </button>
                    </div>

                    <div className="bg-white border-2 border-slate-300 rounded-lg p-6 font-mono text-xs overflow-x-auto">
                      <pre className="whitespace-pre-wrap select-all">
{`-------------------------------------------------------------------------------
SEO BRIEFING - ${currentProject.name.toUpperCase()}
-------------------------------------------------------------------------------

Landingspagina:     ${currentProject.content.landingspagina}

Concurrentie:       ${currentProject.content.concurrentie}

Notitie:            Als bovenstaande niet is ingevuld, zoek relevante
                    concurrentie in top 3 van Google.

-------------------------------------------------------------------------------

Pagetitel:          ${currentProject.content.meta.pageTitle}

Meta-description:   ${currentProject.content.meta.metaDescription}

-------------------------------------------------------------------------------

H1 html-tag:        ${currentProject.content.h1}

Zoekwoorden:        ${currentProject.content.zoekwoorden}

H2 html-tag:        ${currentProject.content.sections[0].h2}

Notitie:            ${currentProject.content.sections[0].notitie}

Content:            ${currentProject.content.sections[0].content}
${currentProject.content.sections[0].bullets.length > 0 ? currentProject.content.sections[0].bullets.map(b => `                    - ${b}`).join('\n') : ''}

H2 html-tag:        ${currentProject.content.sections[1].h2}

Notitie:            ${currentProject.content.sections[1].notitie}

Content:            ${currentProject.content.sections[1].content.replace(/\n\n/g, '\n                    ')}

H2 html-tag:        ${currentProject.content.sections[2].h2}

Notitie:            ${currentProject.content.sections[2].notitie}

Content:            ${currentProject.content.sections[2].content.replace(/\n\n/g, '\n                    ')}

-------------------------------------------------------------------------------

Aantal woorden:     ${currentProject.content.aantalWoorden}

Notitie:            

-------------------------------------------------------------------------------`}
                      </pre>
                    </div>

                    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Zoekwoorden Overzicht</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Hoofdzoekwoord:</span>
                          <p className="text-slate-900 mt-1">{currentProject.keywords.main}</p>
                        </div>
                        {currentProject.keywords.variations.length > 0 && (
                          <div>
                            <span className="font-medium text-slate-700">Variaties ({currentProject.keywords.variations.length}):</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentProject.keywords.variations.map((kw, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {currentProject.keywords.longTail.length > 0 && (
                          <div>
                            <span className="font-medium text-slate-700">Long-tail ({currentProject.keywords.longTail.length}):</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentProject.keywords.longTail.map((kw, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {currentProject.keywords.questions.length > 0 && (
                          <div>
                            <span className="font-medium text-slate-700">Vragen ({currentProject.keywords.questions.length}):</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentProject.keywords.questions.map((kw, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOBriefingGenerator;