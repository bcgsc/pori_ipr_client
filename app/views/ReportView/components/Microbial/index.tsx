import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Tab,
  Tabs,
  Slide,
  Paper,
  LinearProgress,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import Image, { ImageType } from '@/components/Image';

import './index.scss';

const Microbial = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [microbialImages, setMicrobialImages] = useState<Record<string, ImageType>>({});
  const [tabValue, setTabValue] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('right');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const microbialImagesResp = await api.get(
          `/reports/${report.ident}/image/retrieve/microbial.circos.genome,microbial.circos.transcriptome`,
          {},
        ).request();

        setMicrobialImages(microbialImagesResp);
        setIsLoading(false);
      };
      getData();
    }
  }, [report]);

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="microbial">
      <Typography variant="h3">Microbial Integration</Typography>
      {Boolean(Object.keys(microbialImages).length) && !isLoading && (
        <div>
          <div className="microbial__tabs">
            <Paper elevation={0} variant="outlined">
              <Tabs
                indicatorColor="secondary"
                onChange={handleTabChange}
                textColor="secondary"
                value={tabValue}
              >
                {Object.values(microbialImages).map((img, index) => (
                  <Tab key={img.ident} value={index} label={img.key.includes('genome') ? 'Genome' : 'Transcriptome'} />
                ))}
              </Tabs>
            </Paper>
          </div>
          <div className="microbial__images">
            {Object.values(microbialImages).map((img, index) => (
              <Slide
                key={img.ident}
                appear={false}
                direction={direction}
                in={index === tabValue}
                mountOnEnter
                onEntering={() => setDirection('left')}
                onExiting={() => setDirection('right')}
                timeout={300}
                unmountOnExit
              >
                <div>
                  <Image image={img} />
                </div>
              </Slide>
            ))}
          </div>
        </div>
      )}
      {!Object.keys(microbialImages).length && !isLoading && (
        <Typography align="center" className="microbial__none">
          Microbial integration circos plots are not applicable for this case
        </Typography>
      )}
      {isLoading && (
        <LinearProgress />
      )}
    </div>
  );
};

export default Microbial;
