import React, {
  useContext, useEffect, useState, useCallback,
} from 'react';
import {
  Typography,
  Tabs,
  Tab,
  Paper,
  Slide as SlideTransition,
  Divider,
} from '@mui/material';

import api from '@/services/api';
import AlertDialog from '@/components/AlertDialog';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import DemoDescription from '@/components/DemoDescription';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import Slide from './components/Slide';

import UploadSlide from './components/UploadSlide';
import SlideType from './types';

import './index.scss';

type SlidesProps = {
  isPrint?: boolean;
  loadedDispatch: ({ type: string }) => void;
} & WithLoadingInjectedProps;

const Slides = ({
  isLoading,
  isPrint = false,
  loadedDispatch,
  setIsLoading,
}: SlidesProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useReport();

  const [showAlert, setShowAlert] = useState(false);
  const [slides, setSlides] = useState<SlideType[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('right');

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const slidesResp = await api.get(`/reports/${report.ident}/presentation/slide`).request();
          setSlides(slidesResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
          if (loadedDispatch) {
            loadedDispatch({ type: 'slides' });
          }
        }
      };
      getData();
    }
  }, [loadedDispatch, report, setIsLoading]);

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSlideUpload = (newSlide: SlideType) => {
    setSlides((prevSlides) => [...prevSlides, newSlide]);
  };

  const handleSlideDelete = useCallback(async (ident) => {
    try {
      await api.del(`/reports/${report.ident}/presentation/slide/${ident}`, {}).request();
      setSlides((prevSlides) => prevSlides.filter((slide) => slide.ident !== ident));
      snackbar.success('Slide deleted');
    } catch (err) {
      snackbar.error(`Error deleting slide: ${err}`);
    }
  }, [report]);

  const handleAlertClose = (confirmed: boolean, ident: string) => {
    setShowAlert(false);
    if (confirmed) {
      handleSlideDelete(ident);
    }
  };

  return (
    <div className="slides">
      <Typography className="slides__title" variant="h3">Additional Information</Typography>
      <DemoDescription>
        This section allows a genome analyst to upload any supplementary images which may support interpretation of the sequencing results.
      </DemoDescription>
      {!isLoading && (
        <>
          {Boolean(slides.length) && (
            <>
              {!isPrint && (
                <Paper elevation={0} variant="outlined">
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="secondary"
                    textColor="secondary"
                  >
                    {slides.map((slide, index) => (
                      <Tab key={slide.name} value={index} label={slide.name} />
                    ))}
                  </Tabs>
                </Paper>
              )}
              {slides.map((slide, index) => (
                <React.Fragment key={slide.name}>
                  {!isPrint ? (
                    <>
                      <SlideTransition
                        appear={false}
                        in={index === tabValue}
                        direction={direction}
                        mountOnEnter
                        unmountOnExit
                        onEntering={() => setDirection('left')}
                        onExiting={() => setDirection('right')}
                      >
                        <div>
                          <Slide
                            slide={slide}
                            onDelete={() => setShowAlert(true)}
                          />
                        </div>
                      </SlideTransition>
                      <AlertDialog
                        isOpen={showAlert}
                        onClose={(confirmed: boolean) => handleAlertClose(confirmed, slide.ident)}
                        text="Are you sure you want to delete this slide?"
                        title="Confirm"
                      />
                    </>
                  ) : (
                    <Slide
                      isPrint
                      slide={slide}
                    />
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </>
      )}
      {!slides.length && !isLoading && (
        <div className="slides__none">
          <Typography align="center">No slides available</Typography>
        </div>
      )}
      {canEdit && !isPrint && (
        <>
          <Divider />
          <div className="slides__upload">
            <Typography variant="h4" className="slides__upload-title">Add New Slide</Typography>
            <UploadSlide
              onUpload={handleSlideUpload}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default withLoading(Slides);
