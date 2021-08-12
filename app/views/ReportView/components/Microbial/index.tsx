import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Tab,
  Tabs,
  Slide,
  Paper,
} from '@material-ui/core';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import Image, { ImageType } from '@/components/Image';
import { WithLoadingInjectedProps } from '@/hoc/WithLoading';

import './index.scss';

type MicrobialProps = WithLoadingInjectedProps;

const Microbial = ({
  isLoading,
  setIsLoading,
}: MicrobialProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [microbialImages, setMicrobialImages] = useState<ImageType[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('right');

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const microbialImagesResp = await api.get(
            `/reports/${report.ident}/image/retrieve/microbial.circos.genome,microbial.circos.transcriptome`,
          ).request();

          setMicrobialImages(microbialImagesResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [report, setIsLoading]);

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="microbial">
      <Typography variant="h3">Microbial Integration</Typography>
      {Boolean(microbialImages.length) && !isLoading && (
        <div>
          <div className="microbial__tabs">
            <Paper elevation={0} variant="outlined">
              <Tabs
                indicatorColor="secondary"
                onChange={handleTabChange}
                textColor="secondary"
                value={tabValue}
              >
                {microbialImages.map((img, index) => (
                  <Tab key={img.ident} value={index} label={img.key.includes('genome') ? 'Genome' : 'Transcriptome'} />
                ))}
              </Tabs>
            </Paper>
          </div>
          <div className="microbial__images">
            {microbialImages.map((img, index) => (
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
      {!microbialImages.length && !isLoading && (
        <Typography align="center" className="microbial__none">
          Microbial integration circos plots are not applicable for this case
        </Typography>
      )}
    </div>
  );
};

export default Microbial;
