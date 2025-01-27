from django.core.exceptions import ValidationError
from math import modf


def validate_time(value):
    """ Validate time format 00:00:00.000 """
    if len(value) != 12:
        raise ValidationError('Invalid time format. Use hh:mm:ss.mmm')
    else:
        try:
            hours, minutes, seconds = value.split(':')
            hours = int(hours)
            ms, minutes = modf(float(minutes))
            if hours < 0 or hours > 23:
                raise ValidationError('Invalid hours')
            if minutes < 0 or minutes > 59:
                raise ValidationError('Invalid minutes')
            if ms >= 1:
                raise ValidationError('Invalid seconds')
        except ValueError:
            raise ValidationError('Invalid time format. Use hh:mm:ss.mmm')
