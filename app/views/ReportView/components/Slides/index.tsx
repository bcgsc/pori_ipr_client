import React, {
  useContext, useEffect, useState, useCallback,
} from 'react';
import {
  Typography,
  Tabs,
  Tab,
  Paper,
  Slide,
  Divider,
  IconButton,
  LinearProgress,
} from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import EditContext from '@/context/EditContext';
import ConfirmContext from '@/context/ConfirmContext';
import UploadSlide from './components/UploadSlide';
import SlideType from './types';

import './index.scss';

type SlidesProps = {
  isPrint?: boolean;
  loadedDispatch: ({ type: string }) => void;
};

const Slides = ({
  isPrint = false,
  loadedDispatch,
}: SlidesProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);

  const [slides, setSlides] = useState<SlideType[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('right');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const slidesResp = await api.get(`/reports/${report.ident}/presentation/slide`, {}).request();
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
  }, [loadedDispatch, report]);

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSlideUpload = (newSlide: SlideType) => {
    setSlides((prevSlides) => [...prevSlides, newSlide]);
  };

  const handleSlideDelete = useCallback(async (ident) => {
    try {
      await api.del(`/reports/${report.ident}/presentation/slide/${ident}`, {}, {}).request();
      setSlides((prevSlides) => prevSlides.filter((slide) => slide.ident !== ident));
      snackbar.success('Slide deleted');
    } catch (err) {
      snackbar.error(`Error deleting slide: ${err}`);
    }
  }, [report]);

  return (
    <div className="slides">
      <Typography className="slides__title" variant="h3">Additional Information</Typography>
      {Boolean(slides.length) && !isLoading && (
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
            <Slide
              key={slide.name}
              appear={false}
              in={index === tabValue}
              direction={direction}
              mountOnEnter
              unmountOnExit
              onEntering={() => setDirection('left')}
              onExiting={() => setDirection('right')}
            >
              <div className="slides__slide-content">
                <Typography variant="h5" className="slides__title">
                  {slide.name}
                </Typography>
                <div className="slides__slide-container">
                  <img
                    alt={slide.name}
                    className="slides__image"
                    src={`data:${slide.object_type};base64, ${slide.object}`}
                  />
                  {canEdit && !isPrint && (
                    <IconButton
                      className="slides__slide-action"
                      onClick={() => handleSlideDelete(slide.ident)}
                      size="small"
                    >
                      <HighlightOffIcon />
                    </IconButton>
                  )}
                </div>
              </div>
            </Slide>
          ))}
        </>
      )}
      {!slides.length && !isLoading && (
        <div className="slides__none">
          <Typography align="center">No slides available</Typography>
        </div>
      )}
      {isLoading && (
        <LinearProgress />
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

export default Slides;
